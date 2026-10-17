import { NextRequest, NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { discoverCandidatesForTopics } from '@/lib/ingestion/rss';
import { assembleCanonicalEdition } from '@/lib/synthesis/synthesizer';

export async function POST(req: NextRequest) {
  try {
    const { user } = await resolveSessionUser();

    // Fetch user preferences and learned topic weights
    const prefs = await db.userPreference.findUnique({
      where: { userId: user.userId },
    });

    const topics: string[] = prefs?.topics
      ? JSON.parse(prefs.topics)
      : ['Technology & AI', 'Global Economy & Markets', 'Science & Health'];
    const weights: Record<string, number> = prefs?.topicWeights
      ? JSON.parse(prefs.topicWeights)
      : {};

    const depth = (prefs?.readingDepth as 'quick_scan' | 'balanced' | 'deep_dive') || 'balanced';
    const enableSerendipity = prefs?.serendipityMode ?? true;

    // Discover fresh candidate articles from verified RSS feeds
    const candidates = await discoverCandidatesForTopics(topics, 25);

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: 'No fresh articles could be discovered at this time. Please try again.' },
        { status: 502 }
      );
    }

    // Assemble single canonical edition (synthesis, verification, DB persistence)
    const canonicalEdition = await assembleCanonicalEdition(candidates, {
      userId: user.userId,
      userName: user.name,
      topics,
      topicWeights: weights,
      readingDepth: depth,
      enableSerendipity,
    });

    return NextResponse.json({
      success: true,
      edition: canonicalEdition,
      message: `Generated Edition #${canonicalEdition.editionNumber} for ${user.name}`,
    });
  } catch (error) {
    console.error('Edition generation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate edition' },
      { status: 500 }
    );
  }
}
