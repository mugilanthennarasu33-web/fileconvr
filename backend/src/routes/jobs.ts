import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getJobsForUser, getJobById, deleteJob } from '../services/job-history.service.js';
import { getUserUsageSummary } from '../services/quota.service.js';

const router = Router();

/**
 * GET /api/dashboard
 * Summary stats, usage metrics, and recent jobs for authenticated user
 */
router.get('/dashboard', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const [usageSummary, recentJobsResult] = await Promise.all([
      getUserUsageSummary(user.id),
      getJobsForUser(user.id, { page: 1, limit: 5 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
          createdAt: user.createdAt,
        },
        usage: usageSummary,
        recentJobs: recentJobsResult.jobs,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/usage
 * Detailed quota limits and current usage for authenticated user
 */
router.get('/usage', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const usage = await getUserUsageSummary(user.id);
    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs
 * Paginated list of processing jobs with optional filtering
 */
router.get('/jobs', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const toolType = req.query.toolType ? String(req.query.toolType) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;

    const result = await getJobsForUser(user.id, { page, limit, toolType, status });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs/:id
 * Retrieve specific job details, enforcing ownership authorization
 */
router.get('/jobs/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const jobId = String(req.params.id);

    const job = await getJobById(jobId, user.id);
    if (!job) {
      res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'The requested job record was not found.',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err: any) {
    if (err.message && err.message.includes('Unauthorized')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to view this job record.',
        },
      });
      return;
    }
    next(err);
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job record from history, enforcing ownership authorization
 */
router.delete('/jobs/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const jobId = String(req.params.id);

    await deleteJob(jobId, user.id);

    res.status(200).json({
      success: true,
      message: 'Job record removed from history.',
    });
  } catch (err: any) {
    if (err.message && err.message.includes('Unauthorized')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to delete this job record.',
        },
      });
      return;
    }
    if (err.message && err.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'The requested job record was not found.',
        },
      });
      return;
    }
    next(err);
  }
});

export default router;
