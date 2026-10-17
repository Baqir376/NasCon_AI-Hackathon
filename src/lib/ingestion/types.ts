export interface RawFeedItem {
  title: string;
  link: string;
  pubDate?: string;
  creator?: string;
  contentSnippet?: string;
  categories?: string[];
  sourceName?: string;
}

export interface CandidateArticle {
  id: string;
  url: string;
  normalizedUrl: string;
  urlHash: string;
  title: string;
  sourceName: string;
  author?: string;
  publishedAt: Date;
  category: string;
  rawContent: string;
  excerpt: string;
  wordCount: number;
  leadImageUrl?: string;
  clusterId?: string;
  isExtracted: boolean;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  fallbackCategory: string;
  enabled: boolean;
}
