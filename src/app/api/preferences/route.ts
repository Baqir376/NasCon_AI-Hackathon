import { NextRequest, NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { z } from 'zod';

const UpdatePreferencesSchema = z.object({
  topics: z.array(z.string().min(2)).min(1),
  readingDepth: z.enum(['quick_scan', 'balanced', 'deep_dive']).default('balanced'),
  serendipityMode: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const { user } = await resolveSessionUser();
    const body = await req.json();
    const validated = UpdatePreferencesSchema.parse(body);

    // Fetch existing preferences to preserve learned weights
    const existing = await db.userPreference.findUnique({
      where: { userId: user.userId },
    });

    let currentWeights: Record<string, number> = {};
    if (existing?.topicWeights) {
      try {
        currentWeights = JSON.parse(existing.topicWeights);
      } catch {
        currentWeights = {};
      }
    }

    // Initialize baseline weight for any newly selected topics
    for (const topic of validated.topics) {
      if (currentWeights[topic] === undefined) {
        currentWeights[topic] = 1.0;
      }
    }

    const updated = await db.userPreference.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        topics: JSON.stringify(validated.topics),
        topicWeights: JSON.stringify(currentWeights),
        readingDepth: validated.readingDepth,
        serendipityMode: validated.serendipityMode,
      },
      update: {
        topics: JSON.stringify(validated.topics),
        topicWeights: JSON.stringify(currentWeights),
        readingDepth: validated.readingDepth,
        serendipityMode: validated.serendipityMode,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: {
        topics: JSON.parse(updated.topics),
        readingDepth: updated.readingDepth,
        serendipityMode: updated.serendipityMode,
      },
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update preferences' },
      { status: 400 }
    );
  }
}
