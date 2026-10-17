import { describe, it, expect, beforeEach } from 'vitest';
import { synthesizeExtractive } from '../src/lib/synthesis/extractive';
import { verifySourceQuote, verifySynthesis } from '../src/lib/synthesis/verifier';
import { ArticleSynthesisSchema, CanonicalEditionSchema } from '../src/lib/synthesis/schema';
import { CandidateArticle } from '../src/lib/ingestion/types';
import { assembleCanonicalEdition } from '../src/lib/synthesis/synthesizer';
import { db } from '../src/lib/db';

const sampleArticle: CandidateArticle = {
  id: 'cand-001',
  url: 'https://science-wire.com/2026/fusion-record',
  normalizedUrl: 'https://science-wire.com/2026/fusion-record',
  urlHash: 'hash-fusion-001',
  title: 'Tokamak Reactor Sustains 150 Million Degree Plasma for Record Duration',
  sourceName: 'Science Wire',
  author: 'Dr. Marcus Webb',
  publishedAt: new Date(),
  category: 'Clean Energy & Climate',
  rawContent: `The International Magnetic Confinement Facility announced today that its superconducting tokamak reactor maintained a stable deuterium-tritium plasma at 150 million degrees Celsius for 22 consecutive minutes.
This achievement surpasses the previous record by more than 400 percent and demonstrates that active feedback magnetic coils can mitigate edge-localized plasma disruptions in steady-state operations.
Diagnostic sensors recorded a continuous thermal output of 65 megawatts during the pulse, confirming the viability of the high-temperature superconducting magnet design.
Commercial engineering teams are now finalizing specifications for a demonstration power plant scheduled to break ground in late 2029.`,
  excerpt: 'The International Magnetic Confinement Facility announced today that its superconducting tokamak maintained plasma for 22 minutes.',
  wordCount: 110,
  isExtracted: true,
};

describe('Phase 3: AI Synthesis & Deterministic Fallback', () => {
  describe('Extractive Offline Synthesis', () => {
    it('produces structured output conforming to ArticleSynthesisSchema', () => {
      const result = synthesizeExtractive(sampleArticle, 'Clean Energy & Climate', 'balanced');
      const validation = ArticleSynthesisSchema.safeParse(result);

      expect(validation.success).toBe(true);
      expect(result.summaryBullets).toHaveLength(3);
      expect(result.sourceQuote).toBeTruthy();
      expect(result.narrativeText.length).toBeGreaterThan(20);
      expect(result.whyItMatters).toContain('Clean Energy & Climate');
    });

    it('adapts bullet count based on user reading depth preference', () => {
      const quickScan = synthesizeExtractive(sampleArticle, 'Energy', 'quick_scan');
      const deepDive = synthesizeExtractive(sampleArticle, 'Energy', 'deep_dive');

      expect(quickScan.summaryBullets.length).toBe(2);
      expect(deepDive.summaryBullets.length).toBe(4);
    });
  });

  describe('Evidence & Grounding Verification', () => {
    it('verifies true verbatim quotes present in the raw source text', () => {
      const trueQuote = 'The International Magnetic Confinement Facility announced today that its superconducting tokamak reactor maintained a stable deuterium-tritium plasma at 150 million degrees Celsius for 22 consecutive minutes.';
      expect(verifySourceQuote(sampleArticle.rawContent, trueQuote)).toBe(true);
    });

    it('rejects quotes fabricated or hallucinated by model', () => {
      const fabricatedQuote = 'The project was entirely funded by private venture capital investments from Tokyo and Silicon Valley.';
      expect(verifySourceQuote(sampleArticle.rawContent, fabricatedQuote)).toBe(false);
    });

    it('safely adjusts synthesis when a quote is missing or fabricated', () => {
      const ungroundedSynthesis = {
        headline: 'Fusion Breakthrough',
        summaryBullets: [
          'Tokamak achieved steady state plasma.',
          'Continuous thermal output measured at 65 megawatts.',
        ],
        sourceQuote: 'A totally made-up sentence not in the article.',
        narrativeText: 'Researchers achieved a major fusion milestone with stable plasma operation.',
        whyItMatters: 'Advances clean baseload energy.',
      };

      const verified = verifySynthesis(sampleArticle.rawContent, ungroundedSynthesis);
      expect(verified.quoteVerified).toBe(false);
      // Verifier must substitute with a true sentence from rawContent
      expect(sampleArticle.rawContent).toContain(verified.adjustedSynthesis.sourceQuote);
    });
  });

  describe('Canonical Edition Assembly', () => {
    beforeEach(async () => {
      process.env.LLM_PROVIDER = 'offline';
      // Ensure test user exists in database
      await db.user.upsert({
        where: { id: 'test-user-synthesis-001' },
        update: {},
        create: {
          id: 'test-user-synthesis-001',
          sessionToken: 'test-token-synthesis-001',
          name: 'Test Synthesizer User',
          role: 'reader',
        },
      });
    });

    it('assembles a full canonical edition with Lead story and The Horizon serendipity story', async () => {
      const pool: CandidateArticle[] = [
        sampleArticle,
        {
          id: 'cand-002',
          url: 'https://tech-daily.com/ai-kernel',
          normalizedUrl: 'https://tech-daily.com/ai-kernel',
          urlHash: 'hash-ai-002',
          title: 'Compiler Update Delivers 40% Inference Speedup for Transformer Models',
          sourceName: 'Tech Daily',
          publishedAt: new Date(),
          category: 'Technology & AI',
          rawContent: 'Open-source developers have released a specialized compiler backend that optimizes attention matrix multiplication across modern tensor cores.',
          excerpt: 'Open-source compiler optimizes attention matrix multiplication.',
          wordCount: 95,
          isExtracted: true,
        },
        {
          id: 'cand-003',
          url: 'https://astro-journal.org/deep-space-radio',
          normalizedUrl: 'https://astro-journal.org/deep-space-radio',
          urlHash: 'hash-astro-003',
          title: 'Radio Telescope Array Detects Periodic Fast Radio Burst from Magnetar',
          sourceName: 'Astronomy Journal',
          publishedAt: new Date(),
          category: 'Astrophysics', // Outside user's topics -> Candidate for The Horizon!
          rawContent: 'Astronomers using the MeerKAT radio telescope have cataloged a synchronized series of fast radio bursts originating from an extragalactic magnetar.',
          excerpt: 'Astronomers catalog synchronized radio bursts from magnetar.',
          wordCount: 140,
          isExtracted: true,
        },
      ];

      const edition = await assembleCanonicalEdition(pool, {
        userId: 'test-user-synthesis-001',
        userName: 'Alex Chen',
        topics: ['Clean Energy & Climate', 'Technology & AI'],
        readingDepth: 'balanced',
        enableSerendipity: true,
      });

      // Verify against schema
      const parsed = CanonicalEditionSchema.safeParse(edition);
      expect(parsed.success).toBe(true);

      // Verify Lead story
      expect(edition.leadStory).toBeDefined();
      expect(edition.leadStory.headline).toBeTruthy();
      expect(edition.leadStory.sourceUrl).toBeTruthy();

      // Verify Horizon serendipity story was populated from outside topic (Astrophysics)
      expect(edition.horizonStory).toBeDefined();
      expect(edition.horizonStory?.sectionName).toBe('The Horizon');
      expect(edition.horizonStory?.isSerendipity).toBe(true);

      // Verify Database persistence
      const dbEdition = await db.edition.findUnique({
        where: { id: edition.id },
        include: { articles: true },
      });

      expect(dbEdition).toBeDefined();
      expect(dbEdition?.articles.length).toBeGreaterThanOrEqual(2);
    });
  });
});
