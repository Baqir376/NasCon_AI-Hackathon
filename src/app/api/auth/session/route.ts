import { NextResponse } from 'next/server';
import { resolveSessionUser } from '@/lib/auth/guard';
import { db } from '@/lib/db';
import { JUDGE_PERSONAS } from '@/lib/auth/personas';

export async function GET() {
  try {
    const { user, newCookieHeader } = await resolveSessionUser();

    // Fetch user preferences
    const preferences = await db.userPreference.findUnique({
      where: { userId: user.userId },
    });

    const parsedTopics = preferences ? JSON.parse(preferences.topics) : [];
    const parsedWeights = preferences ? JSON.parse(preferences.topicWeights) : {};

    const response = NextResponse.json({
      user: {
        id: user.userId,
        name: user.name,
        role: user.role,
        personaKey: user.personaKey,
      },
      preferences: {
        topics: parsedTopics,
        topicWeights: parsedWeights,
        readingDepth: preferences?.readingDepth || 'balanced',
        serendipityMode: preferences?.serendipityMode ?? true,
      },
      availablePersonas: Object.values(JUDGE_PERSONAS).map((p) => ({
        key: p.key,
        name: p.name,
        title: p.title,
        avatar: p.avatar,
        bio: p.bio,
        topics: p.topics,
      })),
    });

    if (newCookieHeader) {
      response.cookies.set(newCookieHeader.name, newCookieHeader.value, newCookieHeader.options);
    }

    return response;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ error: 'Failed to resolve session' }, { status: 500 });
  }
}
