import { app } from './app.js';
import { config } from './config.js';
import { ensureStorageDirectories } from './utils/storage.js';
import { startPeriodicCleanup, stopPeriodicCleanup } from './services/cleanup.service.js';
import { getDatabaseStatus } from './db/index.js';

async function bootstrap() {
  try {
    // In production, refuse to start without required PostgreSQL database configuration
    if (config.isProd) {
      const dbStatus = getDatabaseStatus();
      if (!dbStatus.isPostgresConfigured) {
        console.error('[FATAL CONFIGURATION ERROR] Production mode requires a valid PostgreSQL DATABASE_URL.');
        console.error('fileconvr will NOT silently run with in-memory storage in production.');
        console.error('Please configure DATABASE_URL in environment before starting production server.');
        process.exit(1);
      }
    }

    // Ensure temporary storage folders exist
    await ensureStorageDirectories();

    // Start background cleaner for expired task files
    startPeriodicCleanup(15);

    const server = app.listen(config.port, () => {
      console.log(`🚀 fileconvr backend server running at http://localhost:${config.port}`);
      console.log(`📁 Temporary storage initialized at: ${config.tempStorageDir}`);
      console.log(`⏱️ File TTL: ${config.fileTtlMinutes} minutes`);
    });

    const shutdown = () => {
      console.log('Shutting down fileconvr backend server gracefully...');
      stopPeriodicCleanup();
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal error starting fileconvr backend:', err);
    process.exit(1);
  }
}

bootstrap();
