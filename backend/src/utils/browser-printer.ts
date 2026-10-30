import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { validatePdfHeader } from './validators.js';

export function getBrowserExecutable(): string {
  if (existsSync(config.chromePath)) {
    return config.chromePath;
  }
  if (existsSync(config.edgePath)) {
    return config.edgePath;
  }
  throw new Error(
    'No compatible browser executable found (neither Google Chrome nor Microsoft Edge was located). Please set CHROME_PATH in environment variables.'
  );
}

export interface HtmlPrintOptions {
  landscape?: boolean;
  pageFormat?: 'A4' | 'Letter';
}

/**
 * Converts an HTML string or file to a valid PDF using headless browser printing.
 */
export async function printHtmlToPdf(
  htmlContent: string,
  outputPath: string,
  tempDir: string,
  options: HtmlPrintOptions = {}
): Promise<void> {
  const browserPath = getBrowserExecutable();
  const tempHtmlPath = path.join(tempDir, `print_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.html`);

  // Wrap HTML with print CSS if not already present
  let styledHtml = htmlContent;
  if (!htmlContent.includes('<style') && !htmlContent.includes('<!DOCTYPE') && !htmlContent.includes('<html>')) {
    const orientation = options.landscape ? 'landscape' : 'portrait';
    const pageSize = options.pageFormat || 'A4';
    styledHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: ${pageSize} ${orientation};
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      font-size: 11pt;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 600;
      text-align: left;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  }

  await fs.writeFile(tempHtmlPath, styledHtml, 'utf8');

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outputPath}`,
    tempHtmlPath,
  ];

  await new Promise<void>((resolve, reject) => {
    execFile(browserPath, args, { timeout: 30000 }, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(`Browser PDF printing failed: ${error.message}. ${stderr || ''}`));
      } else {
        resolve();
      }
    });
  });

  // Cleanup temp html
  try {
    await fs.unlink(tempHtmlPath);
  } catch {
    // ignore
  }

  // Validate the output PDF
  const exists = await fs.stat(outputPath).then((s) => s.size > 0).catch(() => false);
  if (!exists) {
    throw new Error('PDF conversion engine failed to produce an output file.');
  }

  const isValidPdf = await validatePdfHeader(outputPath);
  if (!isValidPdf) {
    throw new Error('Conversion failed: Output file is not a valid PDF document.');
  }
}
