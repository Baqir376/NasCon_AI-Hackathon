import { NextRequest, NextResponse } from 'next/server';
import { switchSessionToPersona } from '@/lib/auth/guard';
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personaKey } = body;

    if (!personaKey || typeof personaKey !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid personaKey' }, { status: 400 });
    }

    const result = await switchSessionToPersona(personaKey);
    if (!result.success || !result.token || !result.user) {
      return NextResponse.json({ error: result.error || 'Failed to switch persona' }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOpts = getSessionCookieOptions(isProduction);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: `Switched session to persona: ${result.user.name}`,
    });

    response.cookies.set(SESSION_COOKIE_NAME, result.token, cookieOpts);
    return response;
  } catch (error) {
    console.error('Error switching persona:', error);
    return NextResponse.json({ error: 'Internal server error switching persona' }, { status: 500 });
  }
}
