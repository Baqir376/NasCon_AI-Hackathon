import crypto from 'crypto';
import { getEnv } from '../env';

export interface SessionPayload {
  sessionId: string;
  userId: string;
  role: 'reader' | 'persona';
  personaKey?: string;
  createdAt: number;
  expiresAt: number;
}

export const SESSION_COOKIE_NAME = 'paper_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  try {
    return getEnv().SESSION_SECRET;
  } catch {
    return 'default-dev-secret-minimum-32-chars-long-hash';
  }
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export function signSessionToken(payload: Omit<SessionPayload, 'expiresAt'>, customDurationMs?: number): string {
  const secret = getSecret();
  const expiresAt = Date.now() + (customDurationMs ?? SESSION_DURATION_MS);
  const fullPayload: SessionPayload = { ...payload, expiresAt };

  const dataString = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataString)
    .digest('base64url');

  return `${dataString}.${signature}`;
}

/**
 * Verifies a session token. Returns the validated payload or null if invalid/tampered/expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [dataString, signature] = token.split('.');
  if (!dataString || !signature) {
    return null;
  }

  const secret = getSecret();
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(dataString)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const jsonString = Buffer.from(dataString, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonString) as SessionPayload;

    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generates cookie configuration options for session persistence.
 */
export function getSessionCookieOptions(isProduction: boolean) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  };
}
