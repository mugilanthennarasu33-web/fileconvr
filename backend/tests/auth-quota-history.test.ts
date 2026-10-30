import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import { PDFDocument } from 'pdf-lib';
import { app } from '../src/app.js';
import { db } from '../src/db/index.js';
import { checkQuota, recordUsage, QuotaExceededError } from '../src/services/quota.service.js';

// Helper to create a minimal valid PDF buffer
async function createSamplePdf(pageCount: number = 2): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage([400, 600]);
    page.drawText(`Page ${i + 1}`, { x: 50, y: 500 });
  }
  return Buffer.from(await pdfDoc.save());
}

describe('Milestone 4 — Authentication, Authorization, History, and Quotas', () => {
  const testUser = {
    email: 'alex.doe@example.com',
    password: 'SecurePassword123!',
    name: 'Alex Doe',
  };

  const otherUser = {
    email: 'other.user@example.com',
    password: 'AnotherPassword456!',
    name: 'Other User',
  };

  describe('1. Authentication Endpoints', () => {
    it('POST /api/auth/register should successfully register a new user and set HTTP-only cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          confirmPassword: testUser.password,
          name: testUser.name,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.user.tier).toBe('free');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');

      // Check HTTP-only cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('session_token=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          confirmPassword: testUser.password,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('POST /api/auth/register should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/auth/register should reject passwords under 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'shortpass@example.com',
          password: 'short',
          confirmPassword: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/auth/register should reject mismatched password confirmation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'mismatch@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/auth/login should authenticate valid user credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.sessionToken).toBeDefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toContain('session_token=');
      expect(cookies[0]).toContain('HttpOnly');
    });

    it('POST /api/auth/login should reject incorrect password with safe message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('POST /api/auth/login should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ghost@example.com',
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('GET /api/auth/me should return current user profile with valid session', async () => {
      // First login to obtain cookie
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const cookie = loginRes.headers['set-cookie'][0];

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(meRes.body.data.user.tier).toBe('free');
    });

    it('POST /api/auth/logout should revoke session and clear cookie', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const cookie = loginRes.headers['set-cookie'][0];

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Verify session is revoked on subsequent request
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(meRes.status).toBe(401);
    });
  });

  describe('2. Authorization and Route Protection', () => {
    it('GET /api/dashboard should reject anonymous unauthenticated requests', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/jobs should reject anonymous unauthenticated requests', async () => {
      const res = await request(app).get('/api/jobs');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/usage should reject anonymous unauthenticated requests', async () => {
      const res = await request(app).get('/api/usage');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Persistent Job Tracking and History', () => {
    let userCookie: string;
    let otherUserCookie: string;
    let createdJobId: string;
    let createdTaskId: string;
    let createdFilename: string;

    beforeAll(async () => {
      // Register or login testUser
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      userCookie = loginRes.headers['set-cookie'][0];

      // Register otherUser
      const regOther = await request(app)
        .post('/api/auth/register')
        .send({
          email: otherUser.email,
          password: otherUser.password,
          confirmPassword: otherUser.password,
          name: otherUser.name,
        });

      if (regOther.status === 201) {
        otherUserCookie = regOther.headers['set-cookie'][0];
      } else {
        const loginOther = await request(app)
          .post('/api/auth/login')
          .send({ email: otherUser.email, password: otherUser.password });
        otherUserCookie = loginOther.headers['set-cookie'][0];
      }
    });

    it('Authenticated PDF operation should automatically persist in job history', async () => {
      const pdfBuffer1 = await createSamplePdf(1);
      const pdfBuffer2 = await createSamplePdf(1);

      const opRes = await request(app)
        .post('/api/pdf/merge')
        .set('Cookie', userCookie)
        .attach('files', pdfBuffer1, 'doc1.pdf')
        .attach('files', pdfBuffer2, 'doc2.pdf');

      expect(opRes.status).toBe(200);
      createdTaskId = opRes.body.data.taskId;
      createdFilename = opRes.body.data.outputFilename;

      // Query user jobs
      const jobsRes = await request(app)
        .get('/api/jobs')
        .set('Cookie', userCookie);

      expect(jobsRes.status).toBe(200);
      expect(jobsRes.body.data.jobs.length).toBeGreaterThan(0);

      const matchedJob = jobsRes.body.data.jobs.find((j: any) => j.taskId === createdTaskId);
      expect(matchedJob).toBeDefined();
      expect(matchedJob.toolType).toBe('merge');
      expect(matchedJob.status).toBe('COMPLETED');
      expect(matchedJob.isFileAvailable).toBe(true);
      expect(matchedJob.downloadUrl).toContain(createdTaskId);

      createdJobId = matchedJob.id;
    });

    it('GET /api/jobs/:id should return details for owner but 403 Forbidden for another user', async () => {
      // Owner access
      const ownerRes = await request(app)
        .get(`/api/jobs/${createdJobId}`)
        .set('Cookie', userCookie);

      expect(ownerRes.status).toBe(200);
      expect(ownerRes.body.data.id).toBe(createdJobId);

      // Unauthorized other user access
      const otherRes = await request(app)
        .get(`/api/jobs/${createdJobId}`)
        .set('Cookie', otherUserCookie);

      expect(otherRes.status).toBe(403);
      expect(otherRes.body.success).toBe(false);
      expect(otherRes.body.error.code).toBe('FORBIDDEN');
    });

    it('GET /api/pdf/download/:taskId/:filename should enforce job ownership authorization', async () => {
      // Owner download succeeds
      const ownerDl = await request(app)
        .get(`/api/pdf/download/${createdTaskId}/${createdFilename}`)
        .set('Cookie', userCookie);

      expect(ownerDl.status).toBe(200);
      expect(ownerDl.headers['content-type']).toBe('application/pdf');

      // Unauthorized other user download is blocked
      const otherDl = await request(app)
        .get(`/api/pdf/download/${createdTaskId}/${createdFilename}`)
        .set('Cookie', otherUserCookie);

      expect(otherDl.status).toBe(403);
      expect(otherDl.body.error.code).toBe('FORBIDDEN');

      // Anonymous download is blocked
      const anonDl = await request(app)
        .get(`/api/pdf/download/${createdTaskId}/${createdFilename}`);

      expect(anonDl.status).toBe(403);
      expect(anonDl.body.error.code).toBe('FORBIDDEN');
    });

    it('GET /api/dashboard should return real metrics and recent jobs for user', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.usage.dailyOperationsUsed).toBeGreaterThanOrEqual(1);
      expect(res.body.data.usage.dailyOperationsLimit).toBe(60); // Free tier daily limit
      expect(res.body.data.recentJobs.length).toBeGreaterThan(0);
    });

    it('DELETE /api/jobs/:id should allow owner to delete history record and reject others', async () => {
      // Other user cannot delete
      const failRes = await request(app)
        .delete(`/api/jobs/${createdJobId}`)
        .set('Cookie', otherUserCookie);

      expect(failRes.status).toBe(403);

      // Owner can delete
      const delRes = await request(app)
        .delete(`/api/jobs/${createdJobId}`)
        .set('Cookie', userCookie);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Verify it is gone
      const checkRes = await request(app)
        .get(`/api/jobs/${createdJobId}`)
        .set('Cookie', userCookie);

      expect(checkRes.status).toBe(404);
    });
  });

  describe('4. Quota and Usage Limits Enforcement', () => {
    it('checkQuota should reject operations exceeding maxFilesPerOperation', async () => {
      await expect(
        checkQuota({
          userId: 'test-user-id',
          tier: 'free',
          fileCount: 30, // Free limit is 25
          totalSizeBytes: 1024,
        })
      ).rejects.toThrow(QuotaExceededError);
    });

    it('checkQuota should reject operations exceeding maxTotalInputSizeBytes', async () => {
      await expect(
        checkQuota({
          userId: 'test-user-id',
          tier: 'free',
          fileCount: 2,
          totalSizeBytes: 300 * 1024 * 1024, // Free limit is 200 MB
        })
      ).rejects.toThrow(QuotaExceededError);
    });

    it('checkQuota should reject operations when daily operations limit is exhausted', async () => {
      const quotaUser = await db.user.create({
        data: {
          email: 'quota.exhausted@example.com',
          passwordHash: 'dummy',
          tier: 'free',
        },
      });

      // Insert 60 usage records for today (Free tier max is 60)
      for (let i = 0; i < 60; i++) {
        await recordUsage({
          userId: quotaUser.id,
          operationType: 'merge',
          bytesProcessed: 1000,
        });
      }

      await expect(
        checkQuota({
          userId: quotaUser.id,
          tier: 'free',
          fileCount: 1,
          totalSizeBytes: 1000,
        })
      ).rejects.toThrow('Daily operations quota exhausted');
    });

    it('Anonymous access to tools should function seamlessly within limits', async () => {
      const pdfBuffer = await createSamplePdf(2);

      // Anonymous split request without any auth cookie
      const res = await request(app)
        .post('/api/pdf/split')
        .attach('file', pdfBuffer, 'anon.pdf')
        .field('ranges', '1')
        .field('mergeResult', 'false');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.outputFilename).toBeDefined();

      // Anonymous download is accessible with valid taskId
      const dlRes = await request(app).get(res.body.data.downloadUrl);
      expect(dlRes.status).toBe(200);
      expect(dlRes.headers['content-type']).toBe('application/pdf');
    });
  });
});
