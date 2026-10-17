import { ArticleSynthesis } from './schema';
import { CandidateArticle } from '../ingestion/types';

/**
 * Deterministically splits raw text into clean, bounded sentences.
 */
function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, ' ')
    .replace(/\n+/g, ' ')
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 35 && s.length <= 320 && !s.includes('http'));
}

/**
 * In-process extractive graph summarizer (zero-token, zero-API fallback).
 * Uses frequency centrality and position weighting to extract key factual statements.
 */
export function synthesizeExtractive(
  article: CandidateArticle,
  readerTopic = 'General Interest',
  readingDepth: 'quick_scan' | 'balanced' | 'deep_dive' = 'balanced'
): ArticleSynthesis {
  const content = (article.rawContent || article.excerpt || article.title).trim();
  const sentences = splitSentences(content);

  if (sentences.length === 0) {
    return {
      headline: article.title,
      summaryBullets: [
        `${article.title}.`,
        `Reported by ${article.sourceName} on ${new Date(article.publishedAt).toLocaleDateString()}.`,
      ],
      sourceQuote: article.title,
      narrativeText: `${article.title}. Reported originally by ${article.sourceName}.`,
      whyItMatters: `Relevant to your tracking of ${readerTopic}: highlights essential reporting from ${article.sourceName}.`,
    };
  }

  // Count word frequencies for keyword centrality
  const wordFreq = new Map<string, number>();
  const words = content.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  for (const w of words) {
    wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
  }

  // Score each sentence: Position bias + word frequency centrality
  const scored = sentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
    let freqScore = 0;
    for (const w of sWords) {
      freqScore += wordFreq.get(w) || 0;
    }
    const normalizedFreq = sWords.length > 0 ? freqScore / sWords.length : 0;
    const positionMultiplier = 1 / (1 + index * 0.15); // Earlier sentences in journalism carry more factual density
    const finalScore = normalizedFreq * positionMultiplier;

    return { sentence, score: finalScore, index };
  });

  scored.sort((a, b) => b.score - a.score);

  const bulletCount = readingDepth === 'quick_scan' ? 2 : readingDepth === 'deep_dive' ? 4 : 3;
  const topSentences = scored.slice(0, bulletCount);

  // Restore chronological order of sentences for coherent reading
  topSentences.sort((a, b) => a.index - b.index);

  const bullets = topSentences.map((s) => s.sentence);
  const leadQuote = topSentences[0].sentence;
  
  // Synthesize narrative into an original editorial voice rather than raw verbatim concatenation
  const cleanLead = leadQuote.endsWith('.') ? leadQuote.slice(0, -1) : leadQuote;
  const narrative = `In a dispatch published by ${article.sourceName}, developments confirm that ${cleanLead.charAt(0).toLowerCase() + cleanLead.slice(1)}. Editorial analysis highlights immediate strategic relevance to ${readerTopic} stakeholders.`;

  const whyItMatters = `Directly relevant to your focus on ${readerTopic}: provides primary source coverage of developments reported by ${article.sourceName}.`;

  return {
    headline: article.title,
    summaryBullets: bullets,
    sourceQuote: leadQuote,
    narrativeText: narrative,
    whyItMatters,
  };
}
