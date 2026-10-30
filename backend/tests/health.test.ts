import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Health Check Endpoint', () => {
  it('GET /api/health should return 200 with service information', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('fileconvr-backend');
    expect(res.body.features).toBeDefined();
    expect(res.body.features.mergePdf).toBe(true);
    expect(res.body.features.splitPdf).toBe(true);
  });
});
