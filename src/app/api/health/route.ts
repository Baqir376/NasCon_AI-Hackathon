import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEnv } from '@/lib/env';

export async function GET() {
  try {
    const env = getEnv();
    // Test database query
    const userCount = await db.user.count();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      provider: env.LLM_PROVIDER,
      hasGeminiKey: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5),
      database: {
        type: 'sqlite',
        status: 'connected',
        totalUsers: userCount,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}
