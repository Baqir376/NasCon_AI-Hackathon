import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArticleSynthesis, ArticleSynthesisSchema } from './schema';
import { CandidateArticle } from '../ingestion/types';
import { synthesizeExtractive } from './extractive';
import { verifySynthesis } from './verifier';
import { getEnv } from '../env';

/**
 * Synthesizes an article using Google Gemini Flash, with automated fallback to extractive summarizer.
 */
export async function synthesizeWithGemini(
  article: CandidateArticle,
  readerTopic = 'General Interest',
  readingDepth: 'quick_scan' | 'balanced' | 'deep_dive' = 'balanced'
): Promise<{ synthesis: ArticleSynthesis; provider: 'gemini' | 'extractive'; tokenUsage?: number }> {
  const env = getEnv();

  if (!env.GEMINI_API_KEY || env.LLM_PROVIDER === 'offline') {
    const rawSynthesis = synthesizeExtractive(article, readerTopic, readingDepth);
    const verified = verifySynthesis(article.rawContent || article.excerpt, rawSynthesis);
    return { synthesis: verified.adjustedSynthesis, provider: 'extractive', tokenUsage: 0 };
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL_ID,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for high factual precision
      },
    });

    const bulletCount = readingDepth === 'quick_scan' ? 2 : readingDepth === 'deep_dive' ? 4 : 3;

    const prompt = `
You are an elite investigative news editor and master journalist for a prestigious morning broadsheet.
Your task is to synthesize the following news article into an original, source-grounded briefing for a reader interested in "${readerTopic}".

CRITICAL ANTI-PLAGIARISM INSTRUCTIONS:
1. MANDATORY ORIGINAL REWRITING:
   - You MUST write the headline, summary bullets, narrative text, and why-it-matters ENTIRELY IN YOUR OWN ORIGINAL EDITORIAL WORDS.
   - Do NOT copy sentences, clause structures, or distinctive phrasing from the article text.
   - Paraphrase, synthesize, and explain the development with analytical clarity and fresh journalistic vocabulary.
2. VERBATIM EVIDENCE ANCHOR:
   - The ONLY field permitted to have verbatim text from the source is "sourceQuote", which acts as the certified evidentiary citation.
3. FACTUAL INTEGRITY:
   - Only synthesize facts explicitly stated in the source text. Do NOT speculate, extrapolate, or add external background knowledge.

ARTICLE TITLE: ${article.title}
SOURCE PUBLISHER: ${article.sourceName}
ARTICLE TEXT:
${(article.rawContent || article.excerpt).slice(0, 3000)}

Respond strictly in JSON matching this schema:
{
  "headline": "An original, high-impact editorial headline in your own words",
  "summaryBullets": [
    "Exactly ${bulletCount} key synthesized factual takeaways written in your own words"
  ],
  "sourceQuote": "An exact verbatim quote sentence copied from the article text for factual proof",
  "narrativeText": "A 2-sentence original journalistic synthesis explaining the development in fresh prose",
  "whyItMatters": "One sentence in your own words explaining specific relevance to ${readerTopic}"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedJson = JSON.parse(responseText);

    const validated = ArticleSynthesisSchema.parse(parsedJson);
    const verified = verifySynthesis(article.rawContent || article.excerpt, validated);

    return {
      synthesis: verified.adjustedSynthesis,
      provider: 'gemini',
      tokenUsage: result.response.usageMetadata?.totalTokenCount || 650,
    };
  } catch (error) {
    console.warn(`[Synthesis Warning] Gemini synthesis failed for "${article.title}", falling back to extractive:`, error instanceof Error ? error.message : error);
    const fallback = synthesizeExtractive(article, readerTopic, readingDepth);
    const verified = verifySynthesis(article.rawContent || article.excerpt, fallback);
    return { synthesis: verified.adjustedSynthesis, provider: 'extractive', tokenUsage: 0 };
  }
}
