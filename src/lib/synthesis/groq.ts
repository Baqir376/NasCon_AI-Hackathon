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

    const systemPrompt = `You are an elite investigative news editor and master journalist for a prestigious morning broadsheet.
Your primary directive is STRICT SOURCE GROUNDING combined with ZERO PLAGIARISM:
1. MANDATORY ANTI-PLAGIARISM & ORIGINAL EDITORIAL PROSE:
   - You MUST write the headline, summary bullets, narrative text, and why-it-matters ENTIRELY IN YOUR OWN ORIGINAL WORDS.
   - NEVER copy sentences, clause structures, or distinctive phrasing from the article text (except the single required "sourceQuote" field).
   - Paraphrase, synthesize, and explain the development with analytical clarity and fresh journalistic vocabulary.
2. VERBATIM EVIDENCE ANCHOR:
   - The ONLY field permitted to have verbatim text from the source is "sourceQuote", which acts as the certified evidentiary citation.
3. FACTUAL INTEGRITY:
   - Only synthesize facts explicitly stated in the source text. Do NOT speculate or add external knowledge.

Respond strictly in valid JSON matching this exact schema:
{
  "headline": "An original, high-impact editorial headline in your own words",
  "summaryBullets": [
    "Key synthesized factual takeaway 1 in your own words",
    "Key synthesized factual takeaway 2 in your own words"
  ],
  "sourceQuote": "An exact verbatim quote sentence copied directly from the article text for factual proof",
  "narrativeText": "A 2-sentence original journalistic synthesis explaining the development in fresh prose",
  "whyItMatters": "One sentence in your own words explaining specific relevance to ${readerTopic}"
}`;

    const userPrompt = `Synthesize the following news article into an original, source-grounded briefing for a reader interested in "${readerTopic}".
Provide exactly ${bulletCount} summary bullets written in your own words.
Do not plagiarize or copy sentence structures from the source text.

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
