import { ArticleSynthesis, ArticleSynthesisSchema } from './schema';
import { CandidateArticle } from '../ingestion/types';
import { synthesizeExtractive } from './extractive';
import { verifySynthesis } from './verifier';
import { getEnv } from '../env';

/**
 * Synthesizes an article using Groq API with structured JSON output,
 * with automated fallback to the extractive summarizer if offline or unavailable.
 */
export async function synthesizeWithGroq(
  article: CandidateArticle,
  readerTopic = 'General Interest',
  readingDepth: 'quick_scan' | 'balanced' | 'deep_dive' = 'balanced'
): Promise<{ synthesis: ArticleSynthesis; provider: 'groq' | 'extractive'; tokenUsage?: number }> {
  const env = getEnv();

  if (!env.GROQ_API_KEY || env.LLM_PROVIDER === 'offline') {
    const rawSynthesis = synthesizeExtractive(article, readerTopic, readingDepth);
    const verified = verifySynthesis(article.rawContent || article.excerpt, rawSynthesis);
    return { synthesis: verified.adjustedSynthesis, provider: 'extractive', tokenUsage: 0 };
  }

  try {
    const bulletCount = readingDepth === 'quick_scan' ? 2 : readingDepth === 'deep_dive' ? 4 : 3;

    const systemPrompt = `You are an editorial assistant for a prestigious morning newspaper.
Respond strictly in valid JSON matching this exact schema:
{
  "headline": "A concise, objective editorial headline",
  "summaryBullets": [
    "Key factual bullet 1 directly from text",
    "Key factual bullet 2 directly from text"
  ],
  "sourceQuote": "An exact verbatim quote sentence copied directly from the article text",
  "narrativeText": "A 2-sentence journalistic summary synthesizing the core event",
  "whyItMatters": "One sentence explaining specific relevance to ${readerTopic}"
}`;

    const userPrompt = `Synthesize the following news article into a source-grounded briefing for a reader interested in "${readerTopic}".
Provide exactly ${bulletCount} summary bullets.
Only synthesize facts explicitly stated in the source text. Do NOT speculate or add external knowledge.

ARTICLE TITLE: ${article.title}
SOURCE PUBLISHER: ${article.sourceName}
ARTICLE TEXT:
${(article.rawContent || article.excerpt).slice(0, 3000)}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL_ID || 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned empty message content');
    }

    const parsedJson = JSON.parse(content);
    const validated = ArticleSynthesisSchema.parse(parsedJson);
    const verified = verifySynthesis(article.rawContent || article.excerpt, validated);

    return {
      synthesis: verified.adjustedSynthesis,
      provider: 'groq',
      tokenUsage: data.usage?.total_tokens || 500,
    };
  } catch (error) {
    console.warn(`[Synthesis Warning] Groq synthesis failed for "${article.title}", falling back to extractive:`, error instanceof Error ? error.message : error);
    const fallback = synthesizeExtractive(article, readerTopic, readingDepth);
    const verified = verifySynthesis(article.rawContent || article.excerpt, fallback);
    return { synthesis: verified.adjustedSynthesis, provider: 'extractive', tokenUsage: 0 };
  }
}
