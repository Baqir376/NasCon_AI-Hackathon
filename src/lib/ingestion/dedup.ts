import crypto from 'crypto';
import { CandidateArticle } from './types';

/**
 * Strips tracking parameters, hash fragments, and trailing slashes to establish canonical URL.
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hash = '';

    // Remove tracking query params
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
      'source',
      'oc',
      'ved',
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    let clean = parsed.toString();
    if (clean.endsWith('/') && parsed.pathname !== '/') {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Creates SHA-256 fingerprint for a normalized URL.
 */
export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(normalizeUrl(url)).digest('hex');
}

/**
 * Strips common publisher suffixes and cleans title for shingle comparison.
 */
export function cleanTitle(title: string): string {
  if (!title) return '';

  return title
    .replace(/\s*[-–—|]\s*[^-–—|]+$/, '') // Remove trailing " - BBC News", " | TechCrunch"
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates character shingles (n-grams) from cleaned text.
 */
function getShingles(text: string, n = 3): Set<string> {
  const shingles = new Set<string>();
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');
  if (normalized.length < n) {
    shingles.add(normalized);
    return shingles;
  }
  for (let i = 0; i <= normalized.length - n; i++) {
    shingles.add(normalized.slice(i, i + n));
  }
  return shingles;
}

/**
 * Computes Jaccard similarity index between two titles using character 3-grams.
 */
export function computeTitleSimilarity(titleA: string, titleB: string): number {
  const cleanA = cleanTitle(titleA);
  const cleanB = cleanTitle(titleB);

  if (cleanA === cleanB) return 1.0;
  if (!cleanA || !cleanB) return 0.0;

  const shinglesA = getShingles(cleanA, 3);
  const shinglesB = getShingles(cleanB, 3);

  let intersectionSize = 0;
  for (const s of shinglesA) {
    if (shinglesB.has(s)) {
      intersectionSize++;
    }
  }

  const unionSize = shinglesA.size + shinglesB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Deduplicates and clusters candidate articles.
 * Merges syndicated and near-duplicate stories, selecting the highest-quality candidate per cluster.
 */
export function deduplicateCandidates(
  candidates: CandidateArticle[],
  similarityThreshold = 0.65
): CandidateArticle[] {
  const uniqueByUrl = new Map<string, CandidateArticle>();

  // Pass 1: Deduplicate on exact normalized URL
  for (const item of candidates) {
    const norm = normalizeUrl(item.url);
    if (!uniqueByUrl.has(norm)) {
      uniqueByUrl.set(norm, item);
    } else {
      // Keep version with higher word count
      const existing = uniqueByUrl.get(norm)!;
      if (item.wordCount > existing.wordCount) {
        uniqueByUrl.set(norm, item);
      }
    }
  }

  const pool = Array.from(uniqueByUrl.values());
  const clusters: CandidateArticle[][] = [];

  // Pass 2: Semantic title clustering
  for (const article of pool) {
    let matchedCluster: CandidateArticle[] | null = null;

    for (const cluster of clusters) {
      const representative = cluster[0];
      const similarity = computeTitleSimilarity(article.title, representative.title);
      if (similarity >= similarityThreshold) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      matchedCluster.push(article);
    } else {
      clusters.push([article]);
    }
  }

  // Select representative article for each cluster (preferring higher word count & extraction quality)
  return clusters.map((cluster, index) => {
    cluster.sort((a, b) => b.wordCount - a.wordCount);
    const chosen = cluster[0];
    return {
      ...chosen,
      clusterId: `cluster-${index + 1}`,
    };
  });
}
