import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./dev.db'),
  SESSION_SECRET: z.string().min(16).default('nascon26-morning-paper-development-secret-key-change-in-production'),
  LLM_PROVIDER: z.enum(['gemini', 'groq', 'offline']).default('offline'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL_ID: z.string().default('gemini-2.5-flash'),
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL_ID: z.string().default('openai/gpt-oss-120b'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  ENABLE_SERENDIPITY: z.enum(['true', 'false']).default('true'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Environment configuration validation failed');
  }
  return result.data;
}
