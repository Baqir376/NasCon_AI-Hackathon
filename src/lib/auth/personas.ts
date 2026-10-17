export interface PersonaDefinition {
  key: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  topics: string[];
  readingDepth: 'quick_scan' | 'balanced' | 'deep_dive';
  topicWeights: Record<string, number>;
}

export const JUDGE_PERSONAS: Record<string, PersonaDefinition> = {
  alex: {
    key: 'alex',
    userId: 'persona-alex-ai-systems-engineer-001',
    name: 'Alex Chen',
    title: 'AI Systems Architect & LLM Researcher',
    avatar: '💻',
    bio: 'Designs distributed GPU clusters, fine-tunes open-source reasoning models, and tracks production inference latency.',
    topics: ['Artificial Intelligence', 'Open Source Software', 'Cloud Infrastructure', 'Developer Tools'],
    readingDepth: 'deep_dive',
    topicWeights: {
      'Artificial Intelligence': 1.5,
      'Open Source Software': 1.3,
      'Cloud Infrastructure': 1.1,
      'Developer Tools': 1.0,
    },
  },
  sarah: {
    key: 'sarah',
    userId: 'persona-sarah-biotech-founder-002',
    name: 'Dr. Sarah Lin',
    title: 'Genomics Founder & Computational Biologist',
    avatar: '🧬',
    bio: 'Researches CRISPR therapeutics, FDA regulatory pathways, and AI-accelerated protein folding simulations.',
    topics: ['Biotechnology & Genomics', 'Healthcare & Medicine', 'Scientific Breakthroughs', 'Health Policy'],
    readingDepth: 'balanced',
    topicWeights: {
      'Biotechnology & Genomics': 1.5,
      'Healthcare & Medicine': 1.3,
      'Scientific Breakthroughs': 1.2,
      'Health Policy': 0.9,
    },
  },
  marcus: {
    key: 'marcus',
    userId: 'persona-marcus-clean-energy-003',
    name: 'Marcus Vance',
    title: 'Macro Strategist & Clean Infrastructure Investor',
    avatar: '⚡',
    bio: 'Analyzes global grid decarbonization, interest rate policy, battery supply chains, and sovereign energy security.',
    topics: ['Clean Energy & Climate', 'Global Economy & Markets', 'Semiconductors', 'Geopolitics'],
    readingDepth: 'quick_scan',
    topicWeights: {
      'Clean Energy & Climate': 1.4,
      'Global Economy & Markets': 1.4,
      'Semiconductors': 1.1,
      'Geopolitics': 1.0,
    },
  },
};

export function getPersonaByKey(key: string): PersonaDefinition | null {
  return JUDGE_PERSONAS[key] ?? null;
}
