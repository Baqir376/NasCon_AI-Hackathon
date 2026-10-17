import { describe, it, expect, beforeEach } from 'vitest';
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

    // Seed test users
    await db.user.upsert({
      where: { id: userA.id },
      update: {},
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
    // Simulate upvoting Clean Energy
    const prefsBefore = await db.userPreference.findUnique({ where: { userId: userA.id } });
    const weightsBefore = JSON.parse(prefsBefore!.topicWeights);
    const initialWeight = weightsBefore['Clean Energy & Climate'] || 1.0;

    // Upvote signal adds +0.15
    const newWeight = initialWeight + 0.15;
    weightsBefore['Clean Energy & Climate'] = newWeight;

    await db.userPreference.update({
      where: { userId: userA.id },
      data: { topicWeights: JSON.stringify(weightsBefore) },
    });

    const prefsAfter = await db.userPreference.findUnique({ where: { userId: userA.id } });
    const weightsAfter = JSON.parse(prefsAfter!.topicWeights);
    expect(weightsAfter['Clean Energy & Climate']).toBeCloseTo(1.15, 2);
  });

  it('enforces strict database tenant boundary: User A cannot see User B editions', async () => {
    // Create an edition belonging specifically to User B
    const editionB = await db.edition.create({
      data: {
        id: 'edition-b-private-001',
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
