/**
 * Webhook service with retry logic, timeout, and error handling
 */

import { logger } from '@/lib/logger';

interface WebhookPayload {
  prompt: string;
  topic: string;
  timestamp: string;
}

interface WebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 8000;

class WebhookService {
  private getWebhookUrl(): string {
    const url = import.meta.env.VITE_WEBHOOK_URL;
    if (!url) {
      throw new Error('VITE_WEBHOOK_URL environment variable is not set');
    }
    return url;
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number = REQUEST_TIMEOUT_MS
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
  }

  /**
   * Submit to webhook with retry logic
   */
  async submit(
    payload: WebhookPayload,
    attempt = 1
  ): Promise<WebhookResponse> {
    const webhookUrl = this.getWebhookUrl();

    try {
      logger.debug('Webhook submission attempt', {
        attempt,
        prompt: payload.prompt.substring(0, 50),
        maxRetries: MAX_RETRIES,
      });

      const response = await this.fetchWithTimeout(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Try to parse response
      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      logger.info('Webhook submission successful', {
        attempt,
        status: response.status,
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.warn('Webhook submission failed', {
        attempt,
        maxRetries: MAX_RETRIES,
        error: errorMessage,
      });

      // Retry logic
      if (attempt < MAX_RETRIES) {
        const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        logger.info('Retrying webhook submission', {
          nextAttempt: attempt + 1,
          delayMs,
        });

        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.submit(payload, attempt + 1);
      }

      // All retries exhausted
      logger.error('Webhook submission failed after all retries', {
        attempts: MAX_RETRIES,
        error: errorMessage,
      }, error instanceof Error ? error : new Error(errorMessage));

      return {
        success: false,
        error: `Failed after ${MAX_RETRIES} attempts: ${errorMessage}`,
      };
    }
  }
}

export const webhookService = new WebhookService();
