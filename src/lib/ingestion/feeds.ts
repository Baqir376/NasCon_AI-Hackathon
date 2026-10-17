import { FeedSource } from './types';

export const CURATED_FEED_REGISTRY: FeedSource[] = [
  // Technology & AI
  {
    id: 'google-tech',
    name: 'Google News - Technology',
    url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
    category: 'Technology & AI',
    fallbackCategory: 'Technology',
    enabled: true,
  },
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Technology & AI',
    fallbackCategory: 'Technology',
    enabled: true,
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology & AI',
    fallbackCategory: 'Technology',
    enabled: true,
  },

  // Business & Global Economy
  {
    id: 'google-business',
    name: 'Google News - Business',
    url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
    category: 'Global Economy & Markets',
    fallbackCategory: 'Business',
    enabled: true,
  },

  // Science & Health
  {
    id: 'google-science',
    name: 'Google News - Science',
    url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en',
    category: 'Science & Health',
    fallbackCategory: 'Science',
    enabled: true,
  },
  {
    id: 'npr-science',
    name: 'NPR Science',
    url: 'https://feeds.npr.org/1007/rss.xml',
    category: 'Science & Health',
    fallbackCategory: 'Science',
    enabled: true,
  },

  // General & World
  {
    id: 'bbc-world',
    name: 'BBC World News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'World & Geopolitics',
    fallbackCategory: 'General',
    enabled: true,
  },
];

export function getFeedsForTopics(userTopics: string[]): FeedSource[] {
  if (!userTopics || userTopics.length === 0) {
    return CURATED_FEED_REGISTRY;
  }

  const normalizedUserTopics = userTopics.map((t) => t.toLowerCase());

  const matched = CURATED_FEED_REGISTRY.filter((feed) => {
    return (
      normalizedUserTopics.some((ut) => feed.category.toLowerCase().includes(ut)) ||
      normalizedUserTopics.some((ut) => feed.fallbackCategory.toLowerCase().includes(ut)) ||
      normalizedUserTopics.some((ut) => ut.includes(feed.fallbackCategory.toLowerCase()))
    );
  });

  return matched.length > 0 ? matched : CURATED_FEED_REGISTRY;
}
