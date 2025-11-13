/**
 * Environment variable validation
 * Ensures all required environment variables are set at startup
 */

import { logger } from '@/lib/logger';

interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_WEBHOOK_URL: string;
}

/**
 * Validate environment variables at app startup
 * Throws error if any required variable is missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_WEBHOOK_URL',
  ] as const;

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    logger.error('Environment validation failed', { missingVars });
    throw new Error(errorMessage);
  }

  logger.info('Environment validation passed', {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL.substring(0, 30) + '...',
  });

  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_WEBHOOK_URL: import.meta.env.VITE_WEBHOOK_URL,
  };
}
