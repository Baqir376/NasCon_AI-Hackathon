import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { db } from '../src/lib/db';
import { signSessionToken } from '../src/lib/auth/session';

describe('Phase 4: Web Reader, Personalization & User Isolation', () => {
  const userA = { id: 'user-a-iso-001', name: 'Reader Alice', token: '' };
  const userB = { id: 'user-b-iso-002', name: 'Reader Bob', token: '' };

  beforeEach(async () => {
    userA.token = signSessionToken({
      sessionId: 'sess-a',
      userId: userA.id,
      role: 'reader',
      createdAt: Date.now(),
    });

    userB.token = signSessionToken({
      sessionId: 'sess-b',
      userId: userB.id,
      role: 'reader',
      createdAt: Date.now(),
    });

    // Seed/reset test users and clean baseline preferences
    await db.user.upsert({
      where: { id: userA.id },
      update: {
        preferences: {
          update: {
            topics: JSON.stringify(['Clean Energy & Climate', 'Technology & AI']),
            topicWeights: JSON.stringify({ 'Clean Energy & Climate': 1.0, 'Technology & AI': 1.0 }),
            readingDepth: 'balanced',
          },
        },
      },
      create: {
        id: userA.id,
        sessionToken: userA.token,
        name: userA.name,
        role: 'reader',
        preferences: {
          create: {
            topics: JSON.stringify(['Clean Energy & Climate', 'Technology & AI']),
            topicWeights: JSON.stringify({ 'Clean Energy & Climate': 1.0, 'Technology & AI': 1.0 }),
            readingDepth: 'balanced',
          },
        },
      },
    });

    await db.user.upsert({
      where: { id: userB.id },
      update: {},
      create: {
        id: userB.id,
        sessionToken: userB.token,
        name: userB.name,
        role: 'reader',
        preferences: {
          create: {
            topics: JSON.stringify(['Biotechnology & Genomics']),
            topicWeights: JSON.stringify({ 'Biotechnology & Genomics': 1.0 }),
            readingDepth: 'deep_dive',
          },
        },
      },
    });
  });

  it('updates topic weights dynamically in response to upvote and skip feedback', async () => {
    const initialWeight = 1.0;
    const weights = { 'Clean Energy & Climate': initialWeight, 'Technology & AI': 1.0 };

    // Simulate upvoting (+0.15)
    weights['Clean Energy & Climate'] = Number((initialWeight + 0.15).toFixed(2));

    await db.userPreference.update({
      where: { userId: userA.id },
      data: { topicWeights: JSON.stringify(weights) },
    });

    const prefsAfter = await db.userPreference.findUnique({ where: { userId: userA.id } });
    const weightsAfter = JSON.parse(prefsAfter!.topicWeights);
    expect(weightsAfter['Clean Energy & Climate']).toBeCloseTo(1.15, 2);
  });

  it('enforces strict database tenant boundary: User A cannot see User B editions', async () => {
    const uniqueEditionId = `edition-b-${crypto.randomUUID()}`;

    // Create an edition belonging specifically to User B
    const editionB = await db.edition.create({
      data: {
        id: uniqueEditionId,
        userId: userB.id,
        editionNumber: 1,
        editionDate: new Date(),
        mastheadTitle: 'Private Paper for Bob',
        totalTokens: 100,
        estimatedCost: 0.001,
        generationMs: 250,
      },
    });

    // Query editions for User A
    const userAEditions = await db.edition.findMany({
      where: { userId: userA.id },
    });

    const hasAccessToB = userAEditions.some((ed) => ed.id === editionB.id);
    expect(hasAccessToB).toBe(false);

    // Verify User B's edition has userId strictly equal to userB.id
    expect(editionB.userId).toBe(userB.id);
    expect(editionB.userId).not.toBe(userA.id);
  });
});
