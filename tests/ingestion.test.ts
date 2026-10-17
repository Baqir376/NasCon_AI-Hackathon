import { describe, it, expect } from 'vitest';
import { normalizeUrl, hashUrl, computeTitleSimilarity, deduplicateCandidates, cleanTitle } from '../src/lib/ingestion/dedup';
import { extractFromHtml } from '../src/lib/ingestion/extractor';
import { CandidateArticle } from '../src/lib/ingestion/types';

describe('Phase 2: Ingestion, Extraction & Deduplication', () => {
  describe('URL Normalization', () => {
    it('strips tracking parameters and hash fragments', () => {
      const dirtyUrl = 'https://www.reuters.com/technology/ai-breakthrough-2026?utm_source=twitter&utm_medium=social&fbclid=12345#section-header';
      const clean = normalizeUrl(dirtyUrl);
      expect(clean).toBe('https://www.reuters.com/technology/ai-breakthrough-2026');
    });

    it('removes trailing slashes from pathnames', () => {
      const urlWithSlash = 'https://techcrunch.com/2026/03/deep-learning-chips/';
      const clean = normalizeUrl(urlWithSlash);
      expect(clean).toBe('https://techcrunch.com/2026/03/deep-learning-chips');
    });

    it('generates consistent sha256 hash for identical normalized URLs', () => {
      const urlA = 'https://example.com/story?utm_source=news';
      const urlB = 'https://example.com/story?utm_medium=email';
      expect(hashUrl(urlA)).toBe(hashUrl(urlB));
    });
  });

  describe('Title Cleaning & Shingle Similarity', () => {
    it('strips common publisher suffixes cleanly', () => {
      expect(cleanTitle('Quantum Computing Reaches 10,000 Qubits - BBC News')).toBe('quantum computing reaches 10000 qubits');
      expect(cleanTitle('Quantum Computing Reaches 10,000 Qubits | TechCrunch')).toBe('quantum computing reaches 10000 qubits');
      expect(cleanTitle('Quantum Computing Reaches 10,000 Qubits – The Verge')).toBe('quantum computing reaches 10000 qubits');
    });

    it('scores near-identical syndicated headlines above clustering threshold', () => {
      const title1 = 'Fed Cuts Benchmark Interest Rate by 25 Basis Points - Reuters';
      const title2 = 'Fed Cuts Benchmark Interest Rate by 25 Basis Points | AP News';
      const sim = computeTitleSimilarity(title1, title2);
      expect(sim).toBeGreaterThanOrEqual(0.8);
    });

    it('scores distinct stories with low similarity', () => {
      const title1 = 'NASA Rover Discovers Ancient Riverbed on Mars';
      const title2 = 'Global Stock Markets Rally Following Inflation Data';
      const sim = computeTitleSimilarity(title1, title2);
      expect(sim).toBeLessThan(0.25);
    });
  });

  describe('Deduplication & Clustering', () => {
    it('collapses syndicated stories into a single cluster and preserves the best candidate', () => {
      const candidates: CandidateArticle[] = [
        {
          id: '1',
          url: 'https://site-a.com/article?utm_source=feed',
          normalizedUrl: 'https://site-a.com/article',
          urlHash: 'hash-1',
          title: 'Breakthrough Fusion Reactor Sustains Net Energy for 20 Minutes - Reuters',
          sourceName: 'Reuters',
          publishedAt: new Date(),
          category: 'Science',
          rawContent: 'Short wire excerpt of the story.',
          excerpt: 'Short wire excerpt...',
          wordCount: 120,
          isExtracted: true,
        },
        {
          id: '2',
          url: 'https://site-b.com/syndicated-story',
          normalizedUrl: 'https://site-b.com/syndicated-story',
          urlHash: 'hash-2',
          title: 'Breakthrough Fusion Reactor Sustains Net Energy for 20 Minutes | Tech Daily',
          sourceName: 'Tech Daily',
          publishedAt: new Date(),
          category: 'Science',
          rawContent: 'A much longer in-depth coverage of the fusion breakthrough with full experimental details and physics analysis.',
          excerpt: 'A much longer in-depth coverage...',
          wordCount: 350,
          isExtracted: true,
        },
        {
          id: '3',
          url: 'https://site-c.com/unrelated',
          normalizedUrl: 'https://site-c.com/unrelated',
          urlHash: 'hash-3',
          title: 'Global Semiconductor Shipments Rise 14 Percent Year Over Year',
          sourceName: 'Market Watch',
          publishedAt: new Date(),
          category: 'Markets',
          rawContent: 'Semiconductor manufacturers report surge in high-bandwidth memory demand across APAC and North America.',
          excerpt: 'Semiconductor manufacturers report...',
          wordCount: 220,
          isExtracted: true,
        },
      ];

      const deduplicated = deduplicateCandidates(candidates, 0.7);

      // Should collapse the 2 fusion stories into 1, leaving 2 total unique clusters
      expect(deduplicated).toHaveLength(2);

      // The selected fusion story should be the one with the higher word count (350 words)
      const fusionStory = deduplicated.find((c) => c.title.includes('Fusion'));
      expect(fusionStory).toBeDefined();
      expect(fusionStory?.wordCount).toBe(350);
      expect(fusionStory?.clusterId).toBeDefined();
    });
  });

  describe('Mozilla Readability Article Extraction', () => {
    it('extracts clean text from mock news HTML while stripping script and navigation tags', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Next-Gen Solid State Battery Achieves Rapid Charge Milestone</title>
            <meta property="og:image" content="https://example.com/battery.jpg">
          </head>
          <body>
            <header>
              <nav><a href="/">Home</a><a href="/news">News</a></nav>
            </header>
            <main>
              <article>
                <h1>Next-Gen Solid State Battery Achieves Rapid Charge Milestone</h1>
                <p class="byline">By Elena Rostova • Published October 17, 2026</p>
                <div class="ad-banner">Advertisement: Buy Car Insurance Now</div>
                <p>Researchers at the Zurich Energy Institute have demonstrated a solid-state lithium-metal battery capable of reaching an 80 percent charge state in under six minutes without thermal degradation.</p>
                <p>The device utilizes a novel ceramic-sulfide composite electrolyte that prevents dendrite formation under high current densities of up to 25 milliamperes per square centimeter.</p>
                <p>Initial cycling benchmarks indicate that the cell retains 94 percent of its original energy capacity after 1,200 continuous full discharge cycles at ambient room temperature.</p>
                <p>Automotive industry partners are currently preparing pouch cell prototypes for integration into next-generation commercial vehicle platforms starting in late 2027.</p>
              </article>
            </main>
            <footer>
              <p>Copyright 2026 Tech Journal. All rights reserved.</p>
            </footer>
          </body>
        </html>
      `;

      const result = extractFromHtml(sampleHtml, 'https://example.com/battery-milestone');

      expect(result.isValid).toBe(true);
      expect(result.title).toContain('Solid State Battery');
      expect(result.textContent).toContain('Zurich Energy Institute');
      expect(result.textContent).toContain('ceramic-sulfide composite');
      // Should not contain nav or advertisement boilerplate
      expect(result.textContent).not.toContain('Advertisement: Buy Car Insurance');
      expect(result.leadImageUrl).toBe('https://example.com/battery.jpg');
      expect(result.wordCount).toBeGreaterThanOrEqual(80);
    });

    it('flags thin or inaccessible paywalled pages with insufficient words as invalid', () => {
      const paywallHtml = `
        <html>
          <body>
            <h1>Subscribe to Continue Reading</h1>
            <p>You have reached your monthly limit of free articles.</p>
          </body>
        </html>
      `;

      const result = extractFromHtml(paywallHtml, 'https://example.com/paywalled');
      expect(result.isValid).toBe(false);
      expect(result.wordCount).toBeLessThan(80);
    });
  });
});
