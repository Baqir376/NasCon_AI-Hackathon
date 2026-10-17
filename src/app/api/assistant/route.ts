import { NextRequest, NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { getEnv } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const { user } = await resolveSessionUser();
    const body = await req.json();
    const query = String(body.query || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get user's latest edition for context
    const latestEdition = await db.edition.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        articles: {
          include: { article: true },
        },
      },
    });

    // Build context snippet from today's stories
    const storiesContext = latestEdition?.articles?.map((ea) => (
      `- Title: ${ea.headline}\n  Section: ${ea.sectionName}\n  Narrative: ${ea.narrativeText}\n  Quote: "${ea.sourceQuote || ''}"\n  Source: ${ea.sourceCitation}`
    )).join('\n\n') || 'No stories available in today\'s edition.';

    const env = getEnv();
    let answer = '';
    const sources: { title: string; url: string }[] = [];

    if (env.LLM_PROVIDER === 'groq' && env.GROQ_API_KEY) {
      const prompt = `You are the Lead Newsroom Editor for The Personal Morning Paper.
A reader is asking you a question about today's morning edition.
Answer the reader concisely, accurately, and authoritatively, citing only the stories in today's edition provided below.
Do not invent facts. If the information is not in today's paper, say so politely.

TODAY'S EDITION CONTEXT:
${storiesContext}

READER'S QUESTION:
${query}

Respond in 2-3 clear journalistic paragraphs.`;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.GROQ_MODEL_ID || 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: 'You are the chief editorial concierge for a prestigious broadsheet newspaper.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        answer = groqData.choices?.[0]?.message?.content || '';
      }
    }

    // Fallback if Groq unavailable or offline mode
    if (!answer) {
      // Find the most relevant story by keyword match
      const lowerQ = query.toLowerCase();
      const matched = latestEdition?.articles?.find((ea) => (
        ea.headline.toLowerCase().includes(lowerQ) ||
        ea.narrativeText.toLowerCase().includes(lowerQ) ||
        ea.sectionName.toLowerCase().includes(lowerQ)
      )) || latestEdition?.articles?.[0];

      if (matched) {
        answer = `Regarding today's coverage: ${matched.headline}. ${matched.narrativeText} Key primary source evidence: "${matched.sourceQuote || ''}" as cited in ${matched.sourceCitation}.`;
        sources.push({ title: matched.headline, url: matched.article?.url || '#' });
      } else {
        answer = `Today's morning edition features ${latestEdition?.articles?.length || 0} verified dispatches covering technology, science, and the broader horizon. How can I assist you with specific stories?`;
      }
    }

    return NextResponse.json({
      answer,
      sources,
      provider: env.LLM_PROVIDER,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Assistant API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to process editorial query', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
