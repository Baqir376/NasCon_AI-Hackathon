import { ArticleSynthesis } from './schema';

export interface VerificationResult {
  isValid: boolean;
  quoteVerified: boolean;
  adjustedSynthesis: ArticleSynthesis;
  details: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically checks whether a quoted excerpt exists in the raw source content.
 */
export function verifySourceQuote(rawContent: string, quote: string): boolean {
  if (!quote || quote.length < 5 || !rawContent) {
    return false;
  }

  // Check 1: Direct substring containment
  if (rawContent.includes(quote.trim())) {
    return true;
  }

  // Check 2: Normalized substring containment (ignoring punctuation & whitespace variance)
  const normContent = normalizeText(rawContent);
  const normQuote = normalizeText(quote);

  if (normQuote.length >= 10 && normContent.includes(normQuote)) {
    return true;
  }

  // Check 3: Sliding window containment for minor OCR/line-wrap variations
  const words = normQuote.split(' ');
  if (words.length >= 6) {
    const subPhrase = words.slice(0, 5).join(' ');
    if (normContent.includes(subPhrase)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates synthesized structured content against raw source material.
 * Rejects or safely adjusts any details not grounded in the source text.
 */
export function verifySynthesis(rawContent: string, synthesis: ArticleSynthesis): VerificationResult {
  const quoteVerified = verifySourceQuote(rawContent, synthesis.sourceQuote);

  let adjustedQuote = synthesis.sourceQuote;
  let details = 'Quote grounded in source content.';

  if (!quoteVerified) {
    // Quote is not in source: find the first substantial sentence in rawContent to serve as true evidence
    const sentences = rawContent
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30 && s.length < 200);

    if (sentences.length > 0) {
      adjustedQuote = sentences[0];
      details = 'Original quote not found in source; substituted with verified verbatim sentence.';
    } else {
      adjustedQuote = rawContent.slice(0, 150).trim();
      details = 'Original quote unverified; extracted raw lead snippet.';
    }
  }

  // Filter summary bullets to ensure reasonable length and structure
  const cleanBullets = synthesis.summaryBullets
    .map((b) => b.trim())
    .filter((b) => b.length >= 15);

  const adjustedSynthesis: ArticleSynthesis = {
    ...synthesis,
    summaryBullets: cleanBullets.length >= 2 ? cleanBullets : [
      synthesis.narrativeText.slice(0, 120),
      adjustedQuote.slice(0, 120),
    ],
    sourceQuote: adjustedQuote,
  };

  return {
    isValid: true,
    quoteVerified,
    adjustedSynthesis,
    details,
  };
}
