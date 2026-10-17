import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../src/app/api/email/dispatch/route';
import { db } from '../src/lib/db';
import { NextRequest } from 'next/server';
import nodeCrypto from 'crypto';

describe('Email Dispatch Service & Broadsheet Delivery', () => {
  const testEditionId = 'test-edition-email-001';

  beforeEach(async () => {
    await db.user.upsert({
      where: { id: 'test-user-001' },
      update: {},
      create: {
        id: 'test-user-001',
        name: 'Dr. Sarah Lin',
        sessionToken: 'test-sess-token-email-001',
        role: 'reader',
      },
    });

    const testArticle = await db.article.upsert({
      where: { url: 'https://example.com/nature-quantum' },
      update: {},
      create: {
        id: 'art-email-test-001',
        url: 'https://example.com/nature-quantum',
        urlHash: nodeCrypto.createHash('sha256').update('https://example.com/nature-quantum').digest('hex'),
        title: 'Breakthrough in Subatomic Photonic Quantum Interconnects',
        sourceName: 'Nature Quantum Photonics',
        publishedAt: new Date(),
        rawContent: 'A joint consortium of quantum physicists has achieved coherent entanglement transmission.',
        category: 'Technology & AI',
        leadImageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80',
      },
    });

    await db.editionArticle.deleteMany({
      where: { editionId: testEditionId },
    });

    await db.edition.upsert({
      where: { id: testEditionId },
      update: {
        mastheadTitle: 'The Morning Dispatch Test Edition',
      },
      create: {
        id: testEditionId,
        userId: 'test-user-001',
        editionNumber: 42,
        editionDate: new Date(),
        mastheadTitle: 'The Morning Dispatch Test Edition',
      },
    });

    await db.editionArticle.create({
      data: {
        editionId: testEditionId,
        articleId: testArticle.id,
        sectionName: 'Technology & AI',
        positionOrder: 1,
        headline: 'Breakthrough in Subatomic Photonic Quantum Interconnects',
        summaryBullets: JSON.stringify([
          'Engineers demonstrated room-temperature photonic entanglement over 100km fiber.',
          'Latency reduced to 4.2 picoseconds across multi-core processor interconnects.',
        ]),
        sourceQuote: 'We observed coherent entanglement transfer across 100 kilometers with zero packet loss.',
        narrativeText: 'A joint consortium of quantum physicists has achieved coherent entanglement transmission over optical fiber networks.',
        whyItMatters: 'Enables quantum computer clusters without cryogenic interconnect constraints.',
        sourceCitation: 'Nature Quantum Photonics (https://example.com/nature-quantum)',
        isSerendipity: false,
      },
    });
  });

  it('rejects invalid email addresses with 400 status', async () => {
    const req = new NextRequest('http://localhost:3000/api/email/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        recipientEmail: 'not-a-valid-email',
        editionId: testEditionId,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation Error');
  });

  it('returns 404 when requested edition does not exist', async () => {
    const req = new NextRequest('http://localhost:3000/api/email/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        recipientEmail: 'reader@example.com',
        editionId: 'non-existent-edition-xyz',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('successfully dispatches morning edition and generates responsive broadsheet HTML template', async () => {
    const req = new NextRequest('http://localhost:3000/api/email/dispatch', {
      method: 'POST',
      body: JSON.stringify({
        recipientEmail: 'investor@syndicate.com',
        recipientName: 'Dr. Sarah Lin',
        editionId: testEditionId,
        deliveryTime: 'instant',
        format: 'html_broadsheet',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.dispatchId).toContain('COURIER-');
    expect(data.recipientEmail).toBe('investor@syndicate.com');
    expect(data.recipientName).toBe('Dr. Sarah Lin');
    expect(data.editionNumber).toBe(42);
    expect(data.previewHtml).toContain('The Morning Dispatch Test Edition');
    expect(data.previewHtml).toContain('Breakthrough in Subatomic Photonic Quantum Interconnects');
    expect(data.previewHtml).toContain('PRIMARY SOURCE ATTESTATION:');
  });
});
