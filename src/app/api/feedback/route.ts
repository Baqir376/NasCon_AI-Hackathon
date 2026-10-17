import { NextRequest, NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { z } from 'zod';

const FeedbackSchema = z.object({
  articleId: z.string(),
  topic: z.string().optional(),
  eventType: z.enum(['upvote', 'skip', 'save', 'thumbs_down', 'read_deep']),
  dwellTimeMs: z.number().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const { user } = await resolveSessionUser();
    const body = await req.json();
    const validated = FeedbackSchema.parse(body);

    // Record feedback signal in database
    await db.feedbackSignal.create({
      data: {
        userId: user.userId,
        articleId: validated.articleId,
        eventType: validated.eventType,
        dwellTimeMs: validated.dwellTimeMs,
      },
    });

    // If saving article, add to savedArticles table
    if (validated.eventType === 'save') {
      await db.savedArticle.upsert({
        where: {
          id: `${user.userId}-${validated.articleId}`,
        },
        create: {
          id: `${user.userId}-${validated.articleId}`,
          userId: user.userId,
          articleId: validated.articleId,
        },
        update: {},
      });
    }

    // Adaptive Learning Loop: Dynamically adjust user topic weights
    if (validated.topic) {
      const prefs = await db.userPreference.findUnique({
        where: { userId: user.userId },
      });

      if (prefs) {
        let weights: Record<string, number> = {};
        try {
          weights = JSON.parse(prefs.topicWeights);
        } catch {
          weights = {};
        }

        const currentWeight = weights[validated.topic] ?? 1.0;
        let delta = 0;

        switch (validated.eventType) {
          case 'upvote':
            delta = 0.15;
            break;
          case 'save':
            delta = 0.20;
            break;
          case 'skip':
            delta = -0.15;
            break;
          case 'thumbs_down':
            delta = -0.20;
            break;
          case 'read_deep':
            delta = 0.10;
            break;
        }

        const newWeight = Math.max(0.2, Math.min(2.5, Number((currentWeight + delta).toFixed(2))));
        weights[validated.topic] = newWeight;

        await db.userPreference.update({
          where: { userId: user.userId },
          data: {
            topicWeights: JSON.stringify(weights),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Feedback recorded: ${validated.eventType}`,
      userId: user.userId,
    });
  } catch (error) {
    console.error('Feedback recording error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record feedback' },
      { status: 400 }
    );
  }
}
