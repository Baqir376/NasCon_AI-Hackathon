import { z } from 'zod';

export const ArticleSynthesisSchema = z.object({
  headline: z.string().min(5),
  summaryBullets: z.array(z.string().min(10)).min(2).max(4),
  sourceQuote: z.string().min(5),
  narrativeText: z.string().min(20),
  whyItMatters: z.string().min(10),
});

export type ArticleSynthesis = z.infer<typeof ArticleSynthesisSchema>;

export const CanonicalStorySchema = z.object({
  id: z.string(),
  articleId: z.string(),
  sectionName: z.string(), // "Lead" | "Technology & AI" | "Markets" | "The Horizon"
  positionOrder: z.number(),
  headline: z.string(),
  summaryBullets: z.array(z.string()),
  sourceQuote: z.string().nullable(),
  narrativeText: z.string(),
  whyItMatters: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  publishedAt: z.string(),
  leadImageUrl: z.string().url().optional(),
  isSerendipity: z.boolean().default(false),
});

export type CanonicalStory = z.infer<typeof CanonicalStorySchema>;

export const CanonicalSectionSchema = z.object({
  name: z.string(),
  stories: z.array(CanonicalStorySchema),
});

export type CanonicalSection = z.infer<typeof CanonicalSectionSchema>;

export const CanonicalEditionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  editionNumber: z.number(),
  editionDate: z.string(),
  mastheadTitle: z.string(),
  leadStory: CanonicalStorySchema,
  sections: z.array(CanonicalSectionSchema),
  horizonStory: CanonicalStorySchema.optional(),
  totalTokens: z.number().default(0),
  estimatedCost: z.number().default(0),
  generationMs: z.number().default(0),
  providerUsed: z.string(),
});

export type CanonicalEdition = z.infer<typeof CanonicalEditionSchema>;
