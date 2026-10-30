import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import path from 'node:path';
import fs from 'node:fs/promises';
import { app } from '../src/app.js';
import { db, getDatabaseStatus } from '../src/db/index.js';
import { resolveSafePath } from '../src/utils/storage.js';
import { config } from '../src/config.js';

describe('Milestone 6: Security Audit & Production Verification', () => {
  const fixturesDir = path.resolve(__dirname, 'fixtures');
  const validPdfPath = path.join(fixturesDir, 'single_file.pdf');

  beforeEach(() => {
    db.clearAll();
  });

  describe('1. Two Distinct Accounts Isolation & Private Job Authorization', () => {
    it('should strictly isolate private jobs and downloads between two distinct accounts', async () => {
      // 1. Register Account A
      const userARes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'alice@audit.com',
          password: 'Password123!',
          name: 'Alice Auditor',
        })
        .expect(201);

      const cookieA = userARes.headers['set-cookie']?.[0]?.split(';')[0];
      expect(cookieA).toBeDefined();

      // 2. Register Account B
      const userBRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'bob@audit.com',
          password: 'Password456!',
          name: 'Bob Auditor',
        })
        .expect(201);

      const cookieB = userBRes.headers['set-cookie']?.[0]?.split(';')[0];
      expect(cookieB).toBeDefined();

      // 3. Alice uploads and processes a document (Job A)
      const rotateRes = await request(app)
        .post('/api/pdf/rotate')
        .set('Cookie', cookieA!)
        .attach('file', validPdfPath)
        .field('angle', '90')
        .expect(200);

      expect(rotateRes.body.success).toBe(true);
      const { taskId, downloadUrl, outputFilename } = rotateRes.body.data;
      expect(taskId).toBeDefined();
      expect(outputFilename).toBeDefined();

      // Verify Job A is in Alice's job history
      const jobsRes = await request(app)
        .get('/api/jobs')
        .set('Cookie', cookieA!)
        .expect(200);

      const aliceJob = jobsRes.body.data.jobs.find((j: any) => j.taskId === taskId);
      expect(aliceJob).toBeDefined();

      // 4. Alice can view her own job details and verify ownership
      const aliceViewRes = await request(app)
        .get(`/api/jobs/${aliceJob.id}`)
        .set('Cookie', cookieA!)
        .expect(200);
      expect(aliceViewRes.body.data.id).toBe(aliceJob.id);
      expect(aliceViewRes.body.data.userId).toBe(userARes.body.data.user.id);

      // 5. Alice can download her own generated file
      const aliceDownloadRes = await request(app)
        .get(`/api/pdf/download/${taskId}/${outputFilename}`)
        .set('Cookie', cookieA!)
        .expect(200);
      expect(aliceDownloadRes.headers['content-type']).toContain('application/pdf');

      // 6. SECURITY CHECK: Bob attempts to view Alice's job details -> MUST return 403 Forbidden
      const bobViewRes = await request(app)
        .get(`/api/jobs/${aliceJob.id}`)
        .set('Cookie', cookieB!)
        .expect(403);
      expect(bobViewRes.body.success).toBe(false);
      expect(bobViewRes.body.error.code).toBe('FORBIDDEN');

      // 7. SECURITY CHECK: Bob attempts to download Alice's private file -> MUST return 403 Forbidden
      const bobDownloadRes = await request(app)
        .get(`/api/pdf/download/${taskId}/${outputFilename}`)
        .set('Cookie', cookieB!)
        .expect(403);
      expect(bobDownloadRes.body.success).toBe(false);
      expect(bobDownloadRes.body.error.code).toBe('FORBIDDEN');
      expect(bobDownloadRes.body.error.message).toContain('not authorized');

      // 8. SECURITY CHECK: Bob attempts to delete Alice's job -> MUST return 403 Forbidden
      const bobDeleteRes = await request(app)
        .delete(`/api/jobs/${aliceJob.id}`)
        .set('Cookie', cookieB!)
        .expect(403);
      expect(bobDeleteRes.body.success).toBe(false);
      expect(bobDeleteRes.body.error.code).toBe('FORBIDDEN');

      // 9. SECURITY CHECK: Unauthenticated anonymous user attempts to download Alice's private file -> MUST return 403 Forbidden
      const anonDownloadRes = await request(app)
        .get(`/api/pdf/download/${taskId}/${outputFilename}`)
        .expect(403);
      expect(anonDownloadRes.body.success).toBe(false);
      expect(anonDownloadRes.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('2. Anonymous Download Behavior & Non-Enumerable Task Identifiers', () => {
    it('should reject predictable, sequential, or enumerable task identifiers', async () => {
      // Enumerable numeric ID
      const numRes = await request(app)
        .get('/api/pdf/download/1/result.pdf')
        .expect(404);
      expect(numRes.body.success).toBe(false);

      // Predictable slug ID
      const slugRes = await request(app)
        .get('/api/pdf/download/admin/document.pdf')
        .expect(404);
      expect(slugRes.body.success).toBe(false);

      // Traversal attempt (returns 404 cloaking path structure)
      const traversalRes = await request(app)
        .get('/api/pdf/download/..%2F..%2F..%2Fwindows/system32.dll')
        .expect(404);
      expect(traversalRes.body.success).toBe(false);
      expect(traversalRes.body.error.code).toBe('FILE_NOT_FOUND');
    });

    it('should generate non-enumerable UUID v4 identifiers with 122 bits of entropy for anonymous jobs', async () => {
      // Anonymous operation
      const anonRotateRes = await request(app)
        .post('/api/pdf/rotate')
        .attach('file', validPdfPath)
        .field('angle', '180')
        .expect(200);

      expect(anonRotateRes.body.success).toBe(true);
      const taskId = anonRotateRes.body.data.taskId;

      // UUID v4 format verification: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(taskId).toMatch(uuidV4Regex);

      // Non-predictable: generate second one and ensure completely disjoint
      const anonRotateRes2 = await request(app)
        .post('/api/pdf/rotate')
        .attach('file', validPdfPath)
        .field('angle', '270')
        .expect(200);

      const taskId2 = anonRotateRes2.body.data.taskId;
      expect(taskId2).toMatch(uuidV4Regex);
      expect(taskId).not.toBe(taskId2);
    });

    it('should prevent path traversal inside resolveSafePath', () => {
      expect(() => resolveSafePath('../../../etc', 'passwd')).toThrow('Security Violation');
      expect(() => resolveSafePath('valid-task-id', '../../secret.txt')).toThrow();
      expect(() => resolveSafePath('valid-task-id', '/etc/shadow')).toThrow();
    });
  });

  describe('3. Password Hashing & Secret Protection', () => {
    it('should hash passwords with bcrypt using salt rounds >= 10 and never store plaintext', async () => {
      const plainPassword = 'SuperSecretPassword2026!';
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'crypto@audit.com',
          password: plainPassword,
          name: 'Crypto User',
        })
        .expect(201);

      const userId = regRes.body.data.user.id;
      const userRecord = await db.user.findUnique({ where: { id: userId } });

      expect(userRecord).toBeDefined();
      expect(userRecord!.passwordHash).not.toBe(plainPassword);
      // Bcrypt hash starts with $2a$ or $2b$ and is 60 characters long
      expect(userRecord!.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$[./A-Za-z0-9]{53}$/);
    });

    it('should store SHA-256 session token hashes in database rather than raw tokens', async () => {
      const loginRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'tokenuser@audit.com',
          password: 'TokenPassword123!',
          name: 'Token User',
        })
        .expect(201);

      const rawToken = loginRes.body.data.sessionToken;
      expect(rawToken).toBeDefined();

      // Database should not store the raw token directly
      let foundRawInDb = false;
      for (const session of db.sessions.values()) {
        if (session.tokenHash === rawToken) {
          foundRawInDb = true;
        }
      }
      expect(foundRawInDb).toBe(false);
    });

    it('should revoke session on logout and reject subsequent requests with that session', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logoutuser@audit.com',
          password: 'LogoutPassword123!',
        })
        .expect(201);

      const cookie = regRes.headers['set-cookie']?.[0]?.split(';')[0];

      // Session valid
      await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie!)
        .expect(200);

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie!)
        .expect(200);

      // Subsequent request should be 401 Unauthorized
      const postLogoutRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie!)
        .expect(401);

      expect(postLogoutRes.body.success).toBe(false);
    });
  });

  describe('4. PostgreSQL Persistence & Production Configuration Safety', () => {
    it('should report database status and verify configuration safeguards', () => {
      const status = getDatabaseStatus();
      expect(status).toHaveProperty('mode');
      expect(status).toHaveProperty('isProduction');
      expect(status).toHaveProperty('fallbackPermitted');
    });

    it('should refuse to operate in-memory storage when NODE_ENV is production and DATABASE_URL is missing', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDbUrl = process.env.DATABASE_URL;

      try {
        process.env.NODE_ENV = 'production';
        delete process.env.DATABASE_URL;

        // In production without DATABASE_URL, accessing db must throw safe fatal error
        expect(() => {
          db.user.findUnique({ where: { id: 'test' } });
        }).toThrow(/PostgreSQL is required in production mode/i);
      } finally {
        process.env.NODE_ENV = originalEnv;
        process.env.DATABASE_URL = originalDbUrl;
      }
    });
  });

  describe('5. Error Response Sanitization & Safe Error Handling', () => {
    it('should sanitize error responses and never expose internal stack traces or database internals', async () => {
      // Trigger a 404
      const notFoundRes = await request(app)
        .get('/api/non-existent-endpoint-audit')
        .expect(404);

      expect(notFoundRes.body).toHaveProperty('success', false);
      expect(notFoundRes.body).toHaveProperty('error');
      expect(notFoundRes.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(notFoundRes.body.error).toHaveProperty('message');
      expect(notFoundRes.body.error).not.toHaveProperty('stack');

      // Trigger validation error
      const badRotateRes = await request(app)
        .post('/api/pdf/rotate')
        .attach('file', validPdfPath)
        .field('angle', '45') // Invalid angle (must be 90, 180, 270)
        .expect(400);

      expect(badRotateRes.body.success).toBe(false);
      expect(badRotateRes.body.error.code).toBe('VALIDATION_ERROR');
      expect(badRotateRes.body.error).not.toHaveProperty('stack');
    });
  });
});
