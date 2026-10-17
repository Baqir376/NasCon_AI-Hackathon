import { chromium } from 'playwright';
import { CanonicalEdition } from '../synthesis/schema';
import { buildBroadsheetHtml } from './template';

/**
 * Compiles a CanonicalEdition into a print-grade broadsheet PDF buffer.
 */
export async function generateEditionPdf(edition: CanonicalEdition): Promise<{
  buffer: Buffer;
  mimeType: string;
  isPdf: boolean;
}> {
  const htmlContent = buildBroadsheetHtml(edition);

  try {
    // Attempt headless Chromium launch via Playwright
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
      },
    });

    await browser.close();

    return {
      buffer: Buffer.from(pdfUint8Array),
      mimeType: 'application/pdf',
      isPdf: true,
    };
  } catch (error) {
    console.warn('[PDF Generation Note] Playwright browser not available in this environment, falling back to printable HTML view:', error instanceof Error ? error.message : error);

    // Fallback: return printable HTML document with auto-print script
    const printableHtml = htmlContent.replace(
      '</body>',
      `<script>window.addEventListener('DOMContentLoaded', () => { window.print(); });</script></body>`
    );

    return {
      buffer: Buffer.from(printableHtml, 'utf-8'),
      mimeType: 'text/html; charset=utf-8',
      isPdf: false,
    };
  }
}
