import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'fileconvr-backend',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    features: {
      mergePdf: true,
      splitPdf: true,
      rotatePdf: true,
      compressPdf: true,
      imgToPdf: true,
      pdfToImg: true,
      wordToPdf: true,
      excelToPdf: true,
      pptToPdf: true,
      pdfToWord: true,
      organizePdf: true,
      watermarkPdf: true,
      pageNumbersPdf: true,
      protectPdf: true,
      unlockPdf: true,
      autoCleanup: true,
    },
  });
});

export default router;
