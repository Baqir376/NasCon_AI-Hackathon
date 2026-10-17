import { describe, it, expect } from 'vitest';
import { signSessionToken, verifySessionToken } from '../src/lib/auth/session';
import { JUDGE_PERSONAS, getPersonaByKey } from '../src/lib/auth/personas';

describe('Phase 1: Cryptographic Session Security & User Isolation', () => {
  it('correctly signs and verifies a valid session token', () => {
    const payload = {
      sessionId: 'session-uuid-1234',
      userId: 'user-uuid-5678',
      role: 'reader' as const,
      createdAt: Date.now(),
    };

    const token = signSessionToken(payload);
    expect(token).toContain('.');

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.sessionId).toBe(payload.sessionId);
    expect(verified?.role).toBe('reader');
  });

  it('rejects tampered session tokens', () => {
    const payload = {
      sessionId: 'session-uuid-1234',
      userId: 'user-uuid-5678',
      role: 'reader' as const,
      createdAt: Date.now(),
    };

    const token = signSessionToken(payload);
    const [data, signature] = token.split('.');

    // Tamper with payload (e.g. attempting privilege escalation or impersonation)
    const tamperedData = Buffer.from(
      JSON.stringify({
        ...payload,
        userId: 'attacker-impersonated-user-9999',
      })
    ).toString('base64url');

    const tamperedToken = `${tamperedData}.${signature}`;
    const result = verifySessionToken(tamperedToken);
    expect(result).toBeNull();
  });

  it('rejects expired session tokens', () => {
    const payload = {
      sessionId: 'session-expired',
      userId: 'user-expired',
      role: 'reader' as const,
      createdAt: Date.now() - 10000,
    };

    // Duration of negative 1 second -> immediately expired
    const expiredToken = signSessionToken(payload, -1000);
    const verified = verifySessionToken(expiredToken);
    expect(verified).toBeNull();
  });

  it('verifies that all judge personas have distinct, isolated user IDs', () => {
    const alex = getPersonaByKey('alex');
    const sarah = getPersonaByKey('sarah');
    const marcus = getPersonaByKey('marcus');

    expect(alex).not.toBeNull();
    expect(sarah).not.toBeNull();
    expect(marcus).not.toBeNull();

    // Verify user IDs are distinct (no shared state)
    const userIds = [alex?.userId, sarah?.userId, marcus?.userId];
    const uniqueIds = new Set(userIds);
    expect(uniqueIds.size).toBe(3);

    // Verify distinct topics and interests
    expect(alex?.topics).toContain('Artificial Intelligence');
    expect(sarah?.topics).toContain('Biotechnology & Genomics');
    expect(marcus?.topics).toContain('Clean Energy & Climate');
  });

  it('enforces persona allowlist validation on switching', () => {
    expect(getPersonaByKey('alex')).not.toBeNull();
    expect(getPersonaByKey('invalid-hacker-persona')).toBeNull();
  });
});
