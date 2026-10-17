import { NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { user } = await resolveSessionUser();

    // Query past editions strictly scoped to this user
    const editions = await db.edition.findMany({
      where: { userId: user.userId },
      orderBy: { editionDate: 'desc' },
      select: {
        id: true,
        editionNumber: true,
        editionDate: true,
        mastheadTitle: true,
        totalTokens: true,
        generationMs: true,
        articles: {
          where: { positionOrder: 1 },
          select: {
            headline: true,
            sectionName: true,
          },
        },
      },
    });

    const archiveItems = editions.map((ed) => ({
      id: ed.id,
      editionNumber: ed.editionNumber,
      editionDate: ed.editionDate.toISOString(),
      mastheadTitle: ed.mastheadTitle,
      leadHeadline: ed.articles[0]?.headline || 'Morning Dispatch',
      totalTokens: ed.totalTokens,
      generationMs: ed.generationMs,
    }));

    return NextResponse.json({
      editions: archiveItems,
      totalCount: archiveItems.length,
      userId: user.userId,
    });
  } catch (error) {
    console.error('Error fetching edition archive:', error);
    return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500 });
  }
}
