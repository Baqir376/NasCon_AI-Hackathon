import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ExtractionResult {
  title: string;
  textContent: string;
  excerpt: string;
  byline?: string;
  siteName?: string;
  wordCount: number;
  leadImageUrl?: string;
  isValid: boolean;
  error?: string;
}

/**
 * Extracts clean reader text from an HTML document string using Mozilla Readability.
 */
export function extractFromHtml(html: string, url: string): ExtractionResult {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const parsed = reader.parse();

    if (!parsed || !parsed.textContent) {
      // Fallback: try manual extraction of basic paragraphs
      const body = dom.window.document.body;
      const paragraphs = Array.from(body.querySelectorAll('p'))
        .map((p) => p.textContent?.trim() || '')
        .filter((t) => t.length > 30)
        .join('\n\n');

      const wordCount = paragraphs.split(/\s+/).filter(Boolean).length;
      return {
        title: dom.window.document.title || 'Untitled Article',
        textContent: paragraphs,
        excerpt: paragraphs.slice(0, 200),
        wordCount,
        isValid: wordCount >= 80,
      };
    }

    const cleanedText = parsed.textContent
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

    // Detect lead image if present in OpenGraph or parsed content
    let leadImageUrl: string | undefined;
    const ogImage = dom.window.document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      leadImageUrl = ogImage.getAttribute('content') || undefined;
    }

    return {
      title: parsed.title || 'Untitled Article',
      textContent: cleanedText,
      excerpt: parsed.excerpt || cleanedText.slice(0, 200),
      byline: parsed.byline || undefined,
      siteName: parsed.siteName || undefined,
      leadImageUrl,
      wordCount,
      isValid: wordCount >= 80, // Requires at least 80 words of informative content
    };
  } catch (error) {
    return {
      title: '',
      textContent: '',
      excerpt: '',
      wordCount: 0,
      isValid: false,
      error: error instanceof Error ? error.message : 'Readability parsing failed',
    };
  }
}

/**
 * Safely fetches an article webpage with strict timeout and User-Agent headers.
 */
export async function fetchAndExtractArticle(url: string, timeoutMs = 4000): Promise<ExtractionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (PersonalMorningPaperBot/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        title: '',
        textContent: '',
        excerpt: '',
        wordCount: 0,
        isValid: false,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    const html = await response.text();
    return extractFromHtml(html, url);
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      title: '',
      textContent: '',
      excerpt: '',
      wordCount: 0,
      isValid: false,
      error: error instanceof Error ? error.message : 'Network fetch failed',
    };
  }
}
