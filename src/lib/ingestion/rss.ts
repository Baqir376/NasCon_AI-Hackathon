import Parser from 'rss-parser';
import crypto from 'crypto';
import { RawFeedItem, CandidateArticle } from './types';
import { getFeedsForTopics } from './feeds';
import { normalizeUrl, hashUrl, deduplicateCandidates } from './dedup';
import { extractFromHtml } from './extractor';

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'PersonalMorningPaper/1.0 (https://github.com/Baqir376/NasCon_AI-Hackathon)',
    Accept: 'application/rss+xml, application/xml, text/xml; q=0.9',
  },
});

/**
 * Fetches items from a single RSS feed with timeout and exception safety.
 */
export async function fetchFeedItems(feedUrl: string, sourceName: string, category: string): Promise<RawFeedItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    if (!feed || !feed.items) {
      return [];
    }

    return feed.items.map((item) => ({
      title: item.title?.trim() || 'Untitled',
      link: item.link?.trim() || '',
      pubDate: item.pubDate || item.isoDate,
      creator: item.creator,
      contentSnippet: item.contentSnippet || item.content || '',
      categories: item.categories || [category],
      sourceName: sourceName || feed.title || 'Global News',
    })).filter((item) => item.link.startsWith('http'));
  } catch (error) {
    console.warn(`[Ingestion Warning] Failed to fetch feed ${sourceName} (${feedUrl}):`, error instanceof Error ? error.message : error);
    return []; // Return empty list rather than breaking pipeline
  }
}

/**
 * Discovers candidate articles across user-selected topics.
 * Concurrently queries feeds and runs deduplication.
 */
export async function discoverCandidatesForTopics(
  topics: string[],
  maxCandidates = 30
): Promise<CandidateArticle[]> {
  const feeds = getFeedsForTopics(topics);

  // Concurrently fetch all feeds with Promise.allSettled
  const feedPromises = feeds.map((feed) => fetchFeedItems(feed.url, feed.name, feed.category));
  const results = await Promise.allSettled(feedPromises);

  const rawItems: RawFeedItem[] = [];
  for (const res of results) {
    if (res.status === 'fulfilled') {
      rawItems.push(...res.value);
    }
  }

  // Convert raw feed items to candidate records
  const candidates: CandidateArticle[] = rawItems.map((item) => {
    const normUrl = normalizeUrl(item.link);
    const snippet = item.contentSnippet || '';
    const wordCount = snippet.split(/\s+/).filter(Boolean).length;

    return {
      id: crypto.randomUUID(),
      url: item.link,
      normalizedUrl: normUrl,
      urlHash: hashUrl(normUrl),
      title: item.title,
      sourceName: item.sourceName || 'News Wire',
      author: item.creator,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      category: item.categories?.[0] || 'General',
      rawContent: snippet,
      excerpt: snippet.slice(0, 220),
      wordCount,
      isExtracted: false,
    };
  });

  // Filter out any candidates with zero content or unusable titles
  const validCandidates = candidates.filter(
    (c) => c.title.length > 10 && c.url.startsWith('http')
  );

  // Apply deterministic deduplication
  const deduplicated = deduplicateCandidates(validCandidates);

  return deduplicated.slice(0, maxCandidates);
}
