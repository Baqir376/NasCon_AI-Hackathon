import crypto from 'crypto';
import { db } from '../db';
import { CandidateArticle } from '../ingestion/types';
import { CanonicalEdition, CanonicalStory, CanonicalSection } from './schema';
import { synthesizeWithGemini } from './gemini';
import { synthesizeWithGroq } from './groq';
import { getEnv } from '../env';

export interface AssembleEditionOptions {
  userId: string;
  userName: string;
  topics: string[];
  topicWeights?: Record<string, number>;
  readingDepth?: 'quick_scan' | 'balanced' | 'deep_dive';
  enableSerendipity?: boolean;
}

/**
 * Scores candidate articles based on user topic affinity and content density.
 */
function scoreCandidate(
  article: CandidateArticle,
  userTopics: string[],
  topicWeights: Record<string, number> = {}
): number {
  const normCategory = article.category.toLowerCase();
  let topicAffinity = 0.3; // baseline

  for (const topic of userTopics) {
    const normTopic = topic.toLowerCase();
    if (normCategory.includes(normTopic) || normTopic.includes(normCategory)) {
      const weight = topicWeights[topic] ?? 1.0;
      topicAffinity = Math.max(topicAffinity, weight);
    }
  }

  // Content density boost (articles with substantial text score higher)
  const lengthBoost = Math.min(article.wordCount / 400, 1.2);
  return topicAffinity * lengthBoost;
}

/**
 * Assembles a single canonical newspaper edition from candidate articles.
 * Powers both the responsive web reader and the broadsheet PDF.
 */
export async function assembleCanonicalEdition(
  candidates: CandidateArticle[],
  options: AssembleEditionOptions
): Promise<CanonicalEdition> {
  const startTime = Date.now();
  const userTopics = options.topics.length > 0 ? options.topics : ['Technology & AI', 'Global Markets', 'Science'];
  const topicWeights = options.topicWeights || {};
  const depth = options.readingDepth || 'balanced';

  // Partition candidates into On-Topic vs Outside-Topic (for "The Horizon" serendipity)
  const onTopicCandidates: { candidate: CandidateArticle; score: number }[] = [];
  const outsideCandidates: { candidate: CandidateArticle; score: number }[] = [];

  for (const candidate of candidates) {
    const score = scoreCandidate(candidate, userTopics, topicWeights);
    const matchesUser = userTopics.some(
      (t) =>
        candidate.category.toLowerCase().includes(t.toLowerCase()) ||
        t.toLowerCase().includes(candidate.category.toLowerCase())
    );

    if (matchesUser) {
      onTopicCandidates.push({ candidate, score });
    } else {
      outsideCandidates.push({ candidate, score });
    }
  }

  onTopicCandidates.sort((a, b) => b.score - a.score);
  outsideCandidates.sort((a, b) => b.candidate.wordCount - a.candidate.wordCount);

  // If too few on-topic candidates, promote top outside candidates
  const mainPool = onTopicCandidates.map((c) => c.candidate);
  if (mainPool.length < 5 && outsideCandidates.length > 0) {
    mainPool.push(...outsideCandidates.slice(0, 5 - mainPool.length).map((c) => c.candidate));
  }

  if (mainPool.length === 0) {
    throw new Error('No candidate articles available to assemble edition.');
  }

  // 1. Select Lead Story
  const leadCandidate = mainPool[0];
  const sectionCandidates = mainPool.slice(1, 8); // Next 7 stories for thematic sections

  // 2. Select "The Horizon" Serendipity Story
  let horizonCandidate: CandidateArticle | undefined;
  if (options.enableSerendipity !== false && outsideCandidates.length > 0) {
    horizonCandidate = outsideCandidates[0].candidate;
  }

  let totalTokens = 0;
  let providerUsed: string = 'extractive';

  const synthesizeArticle = async (cand: CandidateArticle, cat: string) => {
    const env = getEnv();
    if (env.LLM_PROVIDER === 'groq') {
      return synthesizeWithGroq(cand, cat, depth);
    }
    return synthesizeWithGemini(cand, cat, depth);
  };

  // Synthesize Lead Story
  const leadSynth = await synthesizeArticle(leadCandidate, leadCandidate.category);
  if (leadSynth.provider !== 'extractive') providerUsed = leadSynth.provider;
  totalTokens += leadSynth.tokenUsage || 0;

  const leadStory: CanonicalStory = {
    id: crypto.randomUUID(),
    articleId: leadCandidate.id,
    sectionName: 'Lead Story',
    positionOrder: 1,
    headline: leadSynth.synthesis.headline,
    summaryBullets: leadSynth.synthesis.summaryBullets,
    sourceQuote: leadSynth.synthesis.sourceQuote,
    narrativeText: leadSynth.synthesis.narrativeText,
    whyItMatters: leadSynth.synthesis.whyItMatters,
    sourceName: leadCandidate.sourceName,
    sourceUrl: leadCandidate.url,
    publishedAt: leadCandidate.publishedAt.toISOString(),
    leadImageUrl: leadCandidate.leadImageUrl,
    isSerendipity: false,
  };

  // Synthesize Section Stories concurrently
  const sectionPromises = sectionCandidates.map(async (candidate, index) => {
    const synth = await synthesizeArticle(candidate, candidate.category);
    if (synth.provider !== 'extractive') providerUsed = synth.provider;
    totalTokens += synth.tokenUsage || 0;

    return {
      id: crypto.randomUUID(),
      articleId: candidate.id,
      sectionName: candidate.category || 'General News',
      positionOrder: index + 2,
      headline: synth.synthesis.headline,
      summaryBullets: synth.synthesis.summaryBullets,
      sourceQuote: synth.synthesis.sourceQuote,
      narrativeText: synth.synthesis.narrativeText,
      whyItMatters: synth.synthesis.whyItMatters,
      sourceName: candidate.sourceName,
      sourceUrl: candidate.url,
      publishedAt: candidate.publishedAt.toISOString(),
      leadImageUrl: candidate.leadImageUrl,
      isSerendipity: false,
    };
  });

  const sectionStories = await Promise.all(sectionPromises);

  // Group stories into coherent editorial sections
  const sectionMap = new Map<string, CanonicalStory[]>();
  for (const story of sectionStories) {
    const list = sectionMap.get(story.sectionName) || [];
    list.push(story);
    sectionMap.set(story.sectionName, list);
  }

  const sections: CanonicalSection[] = Array.from(sectionMap.entries()).map(([name, stories]) => ({
    name,
    stories,
  }));

  // Synthesize Horizon story if present
  let horizonStory: CanonicalStory | undefined;
  if (horizonCandidate) {
    const horizSynth = await synthesizeArticle(horizonCandidate, 'Broader Horizons (Discovery)');
    if (horizSynth.provider !== 'extractive') providerUsed = horizSynth.provider;
    totalTokens += horizSynth.tokenUsage || 0;

    horizonStory = {
      id: crypto.randomUUID(),
      articleId: horizonCandidate.id,
      sectionName: 'The Horizon',
      positionOrder: 99,
      headline: horizSynth.synthesis.headline,
      summaryBullets: horizSynth.synthesis.summaryBullets,
      sourceQuote: horizSynth.synthesis.sourceQuote,
      narrativeText: horizSynth.synthesis.narrativeText,
      whyItMatters: 'Curated outside your usual interests to expand your perspective with high-impact reporting.',
      sourceName: horizonCandidate.sourceName,
      sourceUrl: horizonCandidate.url,
      publishedAt: horizonCandidate.publishedAt.toISOString(),
      leadImageUrl: horizonCandidate.leadImageUrl,
      isSerendipity: true,
    };
  }

  // Count past editions for user
  const pastCount = await db.edition.count({ where: { userId: options.userId } });
  const editionNumber = pastCount + 1;
  const editionId = crypto.randomUUID();
  const generationMs = Date.now() - startTime;
  const estimatedCost = (totalTokens / 1000000) * 0.15; // ~$0.15/1M blended tokens

  const canonicalEdition: CanonicalEdition = {
    id: editionId,
    userId: options.userId,
    editionNumber,
    editionDate: new Date().toISOString(),
    mastheadTitle: `The Morning Paper for ${options.userName}`,
    leadStory,
    sections,
    horizonStory,
    totalTokens,
    estimatedCost,
    generationMs,
    providerUsed,
  };

  // Persist canonical edition in SQLite for history and provenance
  await db.$transaction(async (tx) => {
    // Upsert articles
    // Upsert articles and track true database IDs to preserve foreign key constraints
    const allStories = [leadStory, ...sectionStories, ...(horizonStory ? [horizonStory] : [])];
    const storyToArticleId = new Map<string, string>();

    for (const story of allStories) {
      const articleRecord = await tx.article.upsert({
        where: { url: story.sourceUrl },
        update: {
          title: story.headline,
        },
        create: {
          id: story.articleId,
          url: story.sourceUrl,
          urlHash: crypto.createHash('sha256').update(story.sourceUrl).digest('hex'),
          title: story.headline,
          sourceName: story.sourceName,
          publishedAt: new Date(story.publishedAt),
          rawContent: story.narrativeText,
          category: story.sectionName,
          leadImageUrl: story.leadImageUrl,
        },
      });
      storyToArticleId.set(story.id, articleRecord.id);
    }

    // Create Edition
    const editionRecord = await tx.edition.create({
      data: {
        id: editionId,
        userId: options.userId,
        editionNumber,
        editionDate: new Date(canonicalEdition.editionDate),
        mastheadTitle: canonicalEdition.mastheadTitle,
        totalTokens,
        estimatedCost,
        generationMs,
      },
    });

    // Create Edition Articles with validated foreign key references
    for (const story of allStories) {
      const validArticleId = storyToArticleId.get(story.id) || story.articleId;
      await tx.editionArticle.create({
        data: {
          id: story.id,
          editionId: editionRecord.id,
          articleId: validArticleId,
          sectionName: story.sectionName,
          positionOrder: story.positionOrder,
          headline: story.headline,
          summaryBullets: JSON.stringify(story.summaryBullets),
          sourceQuote: story.sourceQuote,
          narrativeText: story.narrativeText,
          whyItMatters: story.whyItMatters,
          sourceCitation: `${story.sourceName} • ${story.sourceUrl}`,
          isSerendipity: story.isSerendipity,
        },
      });
    }
  });

  return canonicalEdition;
}
