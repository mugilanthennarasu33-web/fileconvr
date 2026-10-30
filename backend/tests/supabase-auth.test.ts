import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { PDFDocument } from 'pdf-lib';
import { app } from '../src/app.js';
import { db } from '../src/db/index.js';
import { createJob, updateJob } from '../src/services/job-history.service.js';

const TEST_SECRET = 'test-supabase-jwt-secret';

// Helper to generate a test Supabase access token
function createMockSupabaseToken(payload: {
  sub: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  expInSec?: number;
}): string {
  const exp = Math.floor(Date.now() / 1000) + (payload.expInSec ?? 3600);
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      role: 'authenticated',
      user_metadata: {
        full_name: payload.name || 'Test Google User',
        avatar_url: payload.avatarUrl || 'https://lh3.googleusercontent.com/test-avatar.jpg',
      },
      exp,
    },
    TEST_SECRET
  );
}

// Helper to create a minimal valid PDF buffer
async function createSamplePdf(): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]);
  page.drawText('Sample Supabase PDF Test', { x: 50, y: 500 });
  return Buffer.from(await pdfDoc.save());
}

describe('Phase 9 — Supabase Auth & Google OAuth Integration Tests', () => {
  const userA_id = '99999999-1111-4000-8000-000000000001';
  const userA_email = 'alice.google@example.com';
  const userA_token = createMockSupabaseToken({
    sub: userA_id,
    email: userA_email,
    name: 'Alice Google',
    avatarUrl: 'https://lh3.googleusercontent.com/alice.jpg',
  });

  const userB_id = '99999999-2222-4000-8000-000000000002';
  const userB_email = 'bob.google@example.com';
  const userB_token = createMockSupabaseToken({
    sub: userB_id,
    email: userB_email,
    name: 'Bob Google',
    avatarUrl: 'https://lh3.googleusercontent.com/bob.jpg',
  });

  describe('1. Supabase Bearer Token Authentication & Profile Sync', () => {
    it('should authenticate user and idempotently provision user profile in db on first token presentation', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userA_token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(userA_id);
      expect(res.body.data.user.email).toBe(userA_email);
      expect(res.body.data.user.name).toBe('Alice Google');
      expect(res.body.data.user.avatarUrl).toBe('https://lh3.googleusercontent.com/alice.jpg');
      expect(res.body.data.user.tier).toBe('free');

      // Verify persistence in db
      const dbUser = await db.user.findUnique({ where: { id: userA_id } });
      expect(dbUser).toBeDefined();
      expect(dbUser?.email).toBe(userA_email);
    });

    it('subsequent calls with the same token should be idempotent and not duplicate profile', async () => {
      const res1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userA_token}`);
      expect(res1.status).toBe(200);

      const res2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userA_token}`);
      expect(res2.status).toBe(200);

      const count = await db.user.count({ where: { id: userA_id } });
      expect(count).toBe(1);
    });

    it('should link existing user by email if previously registered with password', async () => {
      const legacyEmail = 'legacy.user@example.com';
      const legacyId = 'legacy-uuid-12345';
      await db.user.create({
        data: {
          id: legacyId,
          email: legacyEmail,
          passwordHash: 'dummy_hash',
          name: 'Legacy User',
          tier: 'free',
        },
      });

      const googleToken = createMockSupabaseToken({
        sub: 'new-supabase-sub-id',
        email: legacyEmail,
        name: 'Legacy User Google Updated',
        avatarUrl: 'https://lh3.googleusercontent.com/legacy.jpg',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${googleToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(legacyEmail);
      expect(res.body.data.user.name).toBe('Legacy User Google Updated');
      expect(res.body.data.user.avatarUrl).toBe('https://lh3.googleusercontent.com/legacy.jpg');
    });
  });

  describe('2. Token Verification & Security Edge Cases', () => {
    it('should reject expired Supabase access tokens with 401 TOKEN_EXPIRED', async () => {
      const expiredToken = createMockSupabaseToken({
        sub: 'expired-user-id',
        email: 'expired@example.com',
        expInSec: -300, // Expired 5 minutes ago
      });

      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should reject tampered or invalid token signature with 401 INVALID_SIGNATURE / INVALID_TOKEN', async () => {
      const tamperedToken = jwt.sign(
        { sub: 'hacker-id', email: 'hacker@example.com', exp: Math.floor(Date.now() / 1000) + 3600 },
        'wrong-secret-key'
      );

      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(['INVALID_SIGNATURE', 'INVALID_TOKEN']).toContain(res.body.error.code);
    });

    it('should reject missing authentication on protected routes with 401', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject malformed or blank Bearer header with 401', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Multi-User Isolation & Authorization', () => {
    let jobUserA_id: string;
    let jobUserA_taskId: string;

    beforeEach(async () => {
      jobUserA_taskId = `task-user-a-${Date.now()}`;
      const job = await createJob({
        userId: userA_id,
        toolType: 'merge',
        inputFilename: 'userA_doc.pdf',
        outputFilename: 'userA_merged.pdf',
        mimeType: 'application/pdf',
        inputSizeBytes: 1024,
        outputSizeBytes: 2048,
        pageCount: 2,
        taskId: jobUserA_taskId,
      });
      await updateJob(job.id, {
        status: 'COMPLETED',
        outputFilename: 'userA_merged.pdf',
      });
      jobUserA_id = job.id;
    });

    it('User A should be able to view their own processing job details', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobUserA_id}`)
        .set('Authorization', `Bearer ${userA_token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(jobUserA_id);
      expect(res.body.data.userId).toBe(userA_id);
    });

    it('User B CANNOT view User A’s private processing job (Forbidden / Not Found)', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobUserA_id}`)
        .set('Authorization', `Bearer ${userB_token}`);

      // Must be forbidden (403) or hidden (404)
      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('User B CANNOT delete User A’s processing job from history', async () => {
      const res = await request(app)
        .delete(`/api/jobs/${jobUserA_id}`)
        .set('Authorization', `Bearer ${userB_token}`);

      expect([403, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);

      // Verify job still exists in db
      const jobStillExists = await db.processingJob.findUnique({ where: { id: jobUserA_id } });
      expect(jobStillExists).not.toBeNull();
    });

    it('User B CANNOT download User A’s private processed file via task ID', async () => {
      const res = await request(app)
        .get(`/api/pdf/download/${jobUserA_taskId}/userA_merged.pdf`)
        .set('Authorization', `Bearer ${userB_token}`);

      // Backend route checks job.userId and returns 403 FORBIDDEN
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Unauthorized / Anonymous user CANNOT download a registered user’s private processed file', async () => {
      const res = await request(app)
        .get(`/api/pdf/download/${jobUserA_taskId}/userA_merged.pdf`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Manipulating userId in body or query parameters does NOT bypass verified identity', async () => {
      // User B attempts to access jobs by injecting User A's ID
      const res = await request(app)
        .get(`/api/jobs?userId=${userA_id}`)
        .set('Authorization', `Bearer ${userB_token}`);

      expect(res.status).toBe(200);
      // Returned jobs must strictly belong to User B (empty in this case), never User A
      const jobs = res.body.data.jobs;
      for (const j of jobs) {
        expect(j.userId).toBe(userB_id);
      }
    });
  });

  describe('4. Full End-to-End Processing Job with Supabase Token', () => {
    it('POST /api/pdf/merge with Supabase Bearer token should assign job to verified Supabase user UUID', async () => {
      const pdf1 = await createSamplePdf();
      const pdf2 = await createSamplePdf();

      const res = await request(app)
        .post('/api/pdf/merge')
        .set('Authorization', `Bearer ${userA_token}`)
        .attach('files', pdf1, 'doc1.pdf')
        .attach('files', pdf2, 'doc2.pdf');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.taskId).toBeDefined();

      // Verify in db that the job was assigned to userA_id
      const savedJob = await db.processingJob.findFirst({
        where: { taskId: res.body.data.taskId },
      });
      expect(savedJob).toBeDefined();
      expect(savedJob?.userId).toBe(userA_id);
      expect(['merge', 'merge-pdf']).toContain(savedJob?.toolType);
    });

    it('GET /api/dashboard should return recent jobs and usage for the Supabase user', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userA_token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(userA_id);
      expect(res.body.data.recentJobs).toBeDefined();
      expect(Array.isArray(res.body.data.recentJobs)).toBe(true);
      expect(res.body.data.usage).toBeDefined();
    });
  });
});
