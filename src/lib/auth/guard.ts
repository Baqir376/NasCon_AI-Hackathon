import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '../db';
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
  getSessionCookieOptions,
  SessionPayload,
} from './session';
import { JUDGE_PERSONAS, getPersonaByKey } from './personas';

export interface AuthenticatedUser {
  userId: string;
  name: string;
  role: 'reader' | 'persona';
  personaKey?: string;
  sessionToken: string;
}

/**
 * Ensures that the pre-seeded judge personas exist in the database.
 */
export async function ensurePersonasSeeded(): Promise<void> {
  for (const persona of Object.values(JUDGE_PERSONAS)) {
    const existing = await db.user.findUnique({
      where: { id: persona.userId },
      include: { preferences: true },
    });

    if (!existing) {
      await db.user.create({
        data: {
          id: persona.userId,
          sessionToken: `seeded-token-${persona.key}`,
          name: persona.name,
          role: 'persona',
          preferences: {
            create: {
              topics: JSON.stringify(persona.topics),
              topicWeights: JSON.stringify(persona.topicWeights),
              readingDepth: persona.readingDepth,
              serendipityMode: true,
            },
          },
        },
      });
    }
  }
}

/**
 * Extracts and verifies the session from incoming cookies.
 * If no valid session is present, automatically initializes an isolated anonymous reader session.
 */
export async function resolveSessionUser(): Promise<{
  user: AuthenticatedUser;
  newCookieHeader?: { name: string; value: string; options: ReturnType<typeof getSessionCookieOptions> };
}> {
  await ensurePersonasSeeded();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const payload = verifySessionToken(token);
    if (payload) {
      const userRecord = await db.user.findUnique({
        where: { id: payload.userId },
      });

      if (userRecord) {
        return {
          user: {
            userId: userRecord.id,
            name: userRecord.name,
            role: userRecord.role as 'reader' | 'persona',
            personaKey: payload.personaKey,
            sessionToken: token,
          },
        };
      }
    }
  }

  // Provision new isolated reader session
  const newUserId = crypto.randomUUID();
  const newSessionId = crypto.randomUUID();
  const rawToken = signSessionToken({
    sessionId: newSessionId,
    userId: newUserId,
    role: 'reader',
    createdAt: Date.now(),
  });

  await db.user.create({
    data: {
      id: newUserId,
      sessionToken: rawToken,
      name: 'Guest Reader',
      role: 'reader',
      preferences: {
        create: {
          topics: JSON.stringify(['Technology', 'General News', 'Science']),
          topicWeights: JSON.stringify({ Technology: 1.0, 'General News': 1.0, Science: 1.0 }),
          readingDepth: 'balanced',
          serendipityMode: true,
        },
      },
    },
  });

  const isProduction = process.env.NODE_ENV === 'production';
  return {
    user: {
      userId: newUserId,
      name: 'Guest Reader',
      role: 'reader',
      sessionToken: rawToken,
    },
    newCookieHeader: {
      name: SESSION_COOKIE_NAME,
      value: rawToken,
      options: getSessionCookieOptions(isProduction),
    },
  };
}

/**
 * Switches the active session to a designated judge persona.
 */
export async function switchSessionToPersona(personaKey: string): Promise<{
  success: boolean;
  token?: string;
  user?: AuthenticatedUser;
  error?: string;
}> {
  const persona = getPersonaByKey(personaKey);
  if (!persona) {
    return { success: false, error: `Invalid persona key: ${personaKey}` };
  }

  await ensurePersonasSeeded();

  const token = signSessionToken({
    sessionId: crypto.randomUUID(),
    userId: persona.userId,
    role: 'persona',
    personaKey: persona.key,
    createdAt: Date.now(),
  });

  return {
    success: true,
    token,
    user: {
      userId: persona.userId,
      name: persona.name,
      role: 'persona',
      personaKey: persona.key,
      sessionToken: token,
    },
  };
}
