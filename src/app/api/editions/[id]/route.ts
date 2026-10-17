import { NextRequest, NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { CanonicalEdition, CanonicalStory, CanonicalSection } from '@/lib/synthesis/schema';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await resolveSessionUser();
    const { id } = await params;

    const record = await db.edition.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            article: true,
          },
          orderBy: { positionOrder: 'asc' },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: 'Edition not found' }, { status: 404 });
    }

    // Strict Authorization & Isolation Boundary:
    // Only the owner of this edition may access it
    if (record.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to access this edition.' },
        { status: 403 }
      );
    }

    const leadItem = record.articles.find((a) => a.positionOrder === 1) || record.articles[0];
    const sectionItems = record.articles.filter((a) => a.id !== leadItem.id && !a.isSerendipity);
    const horizonItem = record.articles.find((a) => a.isSerendipity);

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
      id: record.id,
      userId: record.userId,
      editionNumber: record.editionNumber,
      editionDate: record.editionDate.toISOString(),
      mastheadTitle: record.mastheadTitle,
      leadStory: toCanonicalStory(leadItem),
      sections,
      horizonStory: horizonItem ? toCanonicalStory(horizonItem) : undefined,
      totalTokens: record.totalTokens,
      estimatedCost: record.estimatedCost,
      generationMs: record.generationMs,
      providerUsed: record.totalTokens > 0 ? 'gemini' : 'extractive',
    };

    return NextResponse.json({ edition: canonical });
  } catch (error) {
    console.error('Error fetching specific edition:', error);
    return NextResponse.json({ error: 'Failed to retrieve edition' }, { status: 500 });
  }
}
