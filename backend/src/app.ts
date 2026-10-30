import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import cookieParser from 'cookie-parser';
import healthRouter from './routes/health.js';
import pdfRouter from './routes/pdf.js';
import authRouter from './routes/auth.js';
import jobsRouter from './routes/jobs.js';
import { authenticateUser } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

export const app = express();

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      // In development or test, allow localhost on any port
      if (!config.isProd && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      
      // Check against explicit allowed origins list
      if (config.allowedOrigins.includes(origin) || origin === config.clientUrl) {
        return callback(null, true);
      }
      
      // In production, reject unallowed origins strictly
      if (config.isProd) {
        return callback(new Error(`CORS policy violation: Origin ${origin} is not allowed.`));
      }
      
      return callback(null, true); // Dev fallback
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach user / anonymous context to every request
app.use(authenticateUser);

// Request logging (sanitized, non-sensitive)
if (!config.isTest) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl || req.url}`, {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs,
      });
    });
    next();
  });
}

// Register API Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api', jobsRouter);
app.use('/api/pdf', pdfRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);
