import { NextRequest, NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { generateEditionPdf } from '@/lib/pdf/generator';
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

    // Strict Authorization & Isolation Boundary
    if (record.userId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    const { buffer, mimeType, isPdf } = await generateEditionPdf(canonical);

    const filename = `MorningPaper-Edition-${record.editionNumber}.${isPdf ? 'pdf' : 'html'}`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving edition PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
