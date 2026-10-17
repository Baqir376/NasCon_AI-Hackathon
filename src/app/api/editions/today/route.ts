import { NextRequest, NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { discoverCandidatesForTopics } from '@/lib/ingestion/rss';
import { assembleCanonicalEdition } from '@/lib/synthesis/synthesizer';
import { CanonicalEdition, CanonicalStory, CanonicalSection } from '@/lib/synthesis/schema';

export async function GET(req: NextRequest) {
  try {
    const { user, newCookieHeader } = await resolveSessionUser();
    const url = new URL(req.url);
    const autoGenerate = url.searchParams.get('autoGenerate') !== 'false';

    // Query most recent edition for this user
    const latestRecord = await db.edition.findFirst({
      where: { userId: user.userId },
      orderBy: { editionDate: 'desc' },
      include: {
        articles: {
          include: {
            article: true,
          },
          orderBy: { positionOrder: 'asc' },
        },
      },
    });

    if (latestRecord) {
      // Reconstruct CanonicalEdition from database record
      const leadItem = latestRecord.articles.find((a) => a.positionOrder === 1) || latestRecord.articles[0];
      const sectionItems = latestRecord.articles.filter((a) => a.id !== leadItem.id && !a.isSerendipity);
      const horizonItem = latestRecord.articles.find((a) => a.isSerendipity);

      const toCanonicalStory = (a: typeof leadItem): CanonicalStory => ({
        id: a.id,
        articleId: a.articleId,
        sectionName: a.sectionName,
        positionOrder: a.positionOrder,
        headline: a.headline,
        summaryBullets: JSON.parse(a.summaryBullets),
        sourceQuote: a.sourceQuote,
        narrativeText: a.narrativeText,
        whyItMatters: a.whyItMatters,
        sourceName: a.article.sourceName,
        sourceUrl: a.article.url,
        publishedAt: a.article.publishedAt.toISOString(),
        leadImageUrl: a.article.leadImageUrl || undefined,
        isSerendipity: a.isSerendipity,
      });

      const sectionMap = new Map<string, CanonicalStory[]>();
      for (const item of sectionItems) {
        const list = sectionMap.get(item.sectionName) || [];
        list.push(toCanonicalStory(item));
        sectionMap.set(item.sectionName, list);
      }

      const sections: CanonicalSection[] = Array.from(sectionMap.entries()).map(([name, stories]) => ({
        name,
        stories,
      }));

      const canonical: CanonicalEdition = {
        id: latestRecord.id,
        userId: latestRecord.userId,
        editionNumber: latestRecord.editionNumber,
        editionDate: latestRecord.editionDate.toISOString(),
        mastheadTitle: latestRecord.mastheadTitle,
        leadStory: toCanonicalStory(leadItem),
        sections,
        horizonStory: horizonItem ? toCanonicalStory(horizonItem) : undefined,
        totalTokens: latestRecord.totalTokens,
        estimatedCost: latestRecord.estimatedCost,
        generationMs: latestRecord.generationMs,
        providerUsed: latestRecord.totalTokens > 0 ? 'gemini' : 'extractive',
      };

      const res = NextResponse.json({ edition: canonical });
      if (newCookieHeader) {
        res.cookies.set(newCookieHeader.name, newCookieHeader.value, newCookieHeader.options);
      }
      return res;
    }

    if (autoGenerate) {
      // Auto-generate fresh first edition
      const prefs = await db.userPreference.findUnique({
        where: { userId: user.userId },
      });

      const topics = prefs?.topics ? JSON.parse(prefs.topics) : ['Technology & AI', 'Global Markets'];
      const weights = prefs?.topicWeights ? JSON.parse(prefs.topicWeights) : {};

      const candidates = await discoverCandidatesForTopics(topics, 20);
      const newEdition = await assembleCanonicalEdition(candidates, {
        userId: user.userId,
        userName: user.name,
        topics,
        topicWeights: weights,
        readingDepth: (prefs?.readingDepth as 'quick_scan' | 'balanced' | 'deep_dive') || 'balanced',
        enableSerendipity: prefs?.serendipityMode ?? true,
      });

      const res = NextResponse.json({ edition: newEdition, isFreshlyGenerated: true });
      if (newCookieHeader) {
        res.cookies.set(newCookieHeader.name, newCookieHeader.value, newCookieHeader.options);
      }
      return res;
    }

    const res = NextResponse.json({ edition: null, message: 'No edition generated yet for this reader.' });
    if (newCookieHeader) {
      res.cookies.set(newCookieHeader.name, newCookieHeader.value, newCookieHeader.options);
    }
    return res;
  } catch (error) {
    console.error('Error fetching today edition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch edition' },
      { status: 500 }
    );
  }
}
