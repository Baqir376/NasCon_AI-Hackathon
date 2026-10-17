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
You are an editorial assistant for a prestigious morning newspaper.
Your task is to synthesize the following news article into a source-grounded briefing for a reader interested in "${readerTopic}".

CRITICAL INSTRUCTIONS:
1. ONLY synthesize facts explicitly stated in the source text. Do NOT speculate, extrapolate, or add external background knowledge.
2. Under "sourceQuote", provide a VERBATIM sentence directly copied from the text to serve as supporting evidence.
3. Under "whyItMatters", write one sentence explaining how this development specifically impacts someone following "${readerTopic}".

ARTICLE TITLE: ${article.title}
SOURCE PUBLISHER: ${article.sourceName}
ARTICLE TEXT:
${(article.rawContent || article.excerpt).slice(0, 3000)}

Respond strictly in JSON matching this schema:
{
  "headline": "A concise, objective editorial headline",
  "summaryBullets": [
    "Exactly ${bulletCount} key factual bullets directly from text"
  ],
  "sourceQuote": "An exact verbatim quote sentence copied from the article text",
  "narrativeText": "A 2-sentence journalistic summary synthesizing the core event",
  "whyItMatters": "One sentence explaining specific relevance to ${readerTopic}"
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
