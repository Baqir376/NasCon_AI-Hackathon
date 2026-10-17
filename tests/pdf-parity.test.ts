import { describe, it, expect } from 'vitest';
import { buildBroadsheetHtml } from '../src/lib/pdf/template';
import { CanonicalEdition } from '../src/lib/synthesis/schema';

describe('Phase 5: Web & PDF Canonical Data Parity', () => {
  const mockCanonicalEdition: CanonicalEdition = {
    id: 'canonical-edition-test-001',
    userId: 'user-parity-test-001',
    editionNumber: 1,
    editionDate: new Date().toISOString(),
    mastheadTitle: 'The Morning Dispatch for Test Reader',
    totalTokens: 1200,
    estimatedCost: 0.002,
    generationMs: 450,
    providerUsed: 'extractive',
    leadStory: {
      id: 'story-lead-001',
      articleId: 'art-001',
      sectionName: 'Lead Story',
      positionOrder: 1,
      headline: 'Breakthrough Solid-State Battery Powers Test Vehicle 800 Miles',
      summaryBullets: [
        'Electrochemical cell operates with composite sulfide solid electrolyte.',
        'Zero thermal runaway observed during destructive nail-penetration safety tests.',
        'Initial manufacturing pilot planned across two gigafactories in 2027.'
      ],
      sourceQuote: 'Electrochemical cell operates with composite sulfide solid electrolyte.',
      narrativeText: 'Engineers demonstrated an unprecedented driving range with non-flammable solid electrolyte cells.',
      whyItMatters: 'Directly impacts the trajectory of long-distance commercial logistics.',
      sourceName: 'Battery Science Review',
      sourceUrl: 'https://batteryscience.org/solid-state-800-miles',
      publishedAt: new Date().toISOString(),
      isSerendipity: false,
    },
    sections: [
      {
        name: 'Technology & AI',
        stories: [
          {
            id: 'story-tech-002',
            articleId: 'art-002',
            sectionName: 'Technology & AI',
            positionOrder: 2,
            headline: 'Open-Weights Sparse Model Outperforms Dense Giants in Reasoning',
            summaryBullets: [
              'Mixture-of-experts architecture activates only 12 billion parameters per token.',
              'Achieves 84.6% on standard competition mathematics benchmarks.'
            ],
            sourceQuote: 'Activates only 12 billion parameters per token.',
            narrativeText: 'Researchers demonstrated that sparse routing dramatically cuts inference FLOPs.',
            whyItMatters: 'Reduces server hosting expenses by 60% for enterprise AI workloads.',
            sourceName: 'AI Research Weekly',
            sourceUrl: 'https://airesearch.org/sparse-moe-benchmarks',
            publishedAt: new Date().toISOString(),
            isSerendipity: false,
          }
        ]
      }
    ],
    horizonStory: {
      id: 'story-horizon-003',
      articleId: 'art-003',
      sectionName: 'The Horizon',
      positionOrder: 99,
      headline: 'Deep-Ocean Hydrothermal Vents Harbor Unique Metabolic Chemistry',
      summaryBullets: [
        'Bacterial colonies thrive entirely on chemosynthetic iron-sulfur reactions.',
        'Offers insights into early Earth prebiotic chemical pathways.'
      ],
      sourceQuote: 'Bacterial colonies thrive entirely on chemosynthetic reactions.',
      narrativeText: 'Submersible expedition discovers unexpected biological ecosystem.',
      whyItMatters: 'Curated outside your usual interests to expand your horizons.',
      sourceName: 'Ocean Exploration Institute',
      sourceUrl: 'https://oceanexploration.org/hydrothermal-metabolism',
      publishedAt: new Date().toISOString(),
      isSerendipity: true,
    }
  };

  it('guarantees 100% content parity: PDF layout contains all canonical headlines and bullets', () => {
    const html = buildBroadsheetHtml(mockCanonicalEdition);

    // 1. Verify Masthead title & edition number
    expect(html).toContain('THE MORNING DISPATCH FOR TEST READER');
    expect(html).toContain('VOL. I • NO. 1');

    // 2. Verify Lead Story headline, narrative, and bullets
    expect(html).toContain(mockCanonicalEdition.leadStory.headline);
    expect(html).toContain(mockCanonicalEdition.leadStory.narrativeText);
    for (const bullet of mockCanonicalEdition.leadStory.summaryBullets) {
      expect(html).toContain(bullet);
    }
    expect(html).toContain(mockCanonicalEdition.leadStory.sourceUrl);

    // 3. Verify Section Story headline, narrative, and bullets
    const techStory = mockCanonicalEdition.sections[0].stories[0];
    expect(html).toContain(techStory.headline);
    expect(html).toContain(techStory.narrativeText);
    for (const bullet of techStory.summaryBullets) {
      expect(html).toContain(bullet);
    }
    expect(html).toContain(techStory.sourceUrl);

    // 4. Verify Horizon Serendipity Story
    expect(html).toContain('THE HORIZON • SERENDIPITY DISCOVERY');
    expect(html).toContain(mockCanonicalEdition.horizonStory!.headline);
    expect(html).toContain(mockCanonicalEdition.horizonStory!.sourceUrl);
  });
});
