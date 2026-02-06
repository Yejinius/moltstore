/**
 * Claude API Client Wrapper
 * Handles rate limiting, cost tracking, and error handling
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  ClaudeRequestOptions,
  ClaudeResponse,
  MODEL_PRICING,
  DEFAULT_AI_REVIEW_CONFIG
} from './types'

// Rate limiter state
interface RateLimitState {
  requests: number
  windowStart: number
}

const rateLimitState: RateLimitState = {
  requests: 0,
  windowStart: Date.now()
}

// Cost tracker
let totalCostThisSession = 0

/**
 * Get Anthropic client instance
 */
function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  return new Anthropic({ apiKey })
}

/**
 * Check and update rate limit
 */
function checkRateLimit(): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute

  // Reset window if expired
  if (now - rateLimitState.windowStart > windowMs) {
    rateLimitState.requests = 0
    rateLimitState.windowStart = now
  }

  const limit = parseInt(process.env.AI_REVIEW_RATE_LIMIT_PER_MINUTE || '10')

  if (rateLimitState.requests >= limit) {
    return false
  }

  rateLimitState.requests++
  return true
}

/**
 * Calculate cost based on token usage
 */
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING]
    || MODEL_PRICING['claude-sonnet-4-20250514']

  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output

  return inputCost + outputCost
}

/**
 * Sleep helper for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Send a message to Claude API with retry logic
 */
export async function sendMessage(
  userMessage: string,
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.')
  }

  const model = options.model
    || process.env.AI_REVIEW_MODEL
    || DEFAULT_AI_REVIEW_CONFIG.model

  const maxTokens = options.maxTokens || 4096
  const temperature = options.temperature ?? 0

  const client = getClient()
  const startTime = Date.now()

  // Retry logic
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const messages: Anthropic.MessageParam[] = [
        { role: 'user', content: userMessage }
      ]

      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: options.systemPrompt,
        messages
      })

      const processingTimeMs = Date.now() - startTime

      // Extract content
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as Anthropic.TextBlock).text)
        .join('\n')

      // Calculate tokens and cost
      const inputTokens = response.usage.input_tokens
      const outputTokens = response.usage.output_tokens
      const totalTokens = inputTokens + outputTokens
      const cost = calculateCost(model, inputTokens, outputTokens)

      // Track total cost
      totalCostThisSession += cost

      return {
        content,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens
        },
        cost,
        processingTimeMs
      }

    } catch (error: any) {
      lastError = error

      // Handle rate limit errors with backoff
      if (error?.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff
        console.warn(`Rate limited by Anthropic API. Waiting ${waitTime}ms before retry...`)
        await sleep(waitTime)
        continue
      }

      // Handle overloaded errors
      if (error?.status === 529) {
        const waitTime = Math.pow(2, attempt) * 2000
        console.warn(`Anthropic API overloaded. Waiting ${waitTime}ms before retry...`)
        await sleep(waitTime)
        continue
      }

      // Don't retry other errors
      throw error
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Send a message expecting JSON response
 */
export async function sendMessageForJSON<T>(
  userMessage: string,
  options: ClaudeRequestOptions = {}
): Promise<{ data: T; response: ClaudeResponse }> {
  const response = await sendMessage(userMessage, options)

  // Try to extract JSON from the response
  let jsonContent = response.content

  // Handle markdown code blocks
  const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    jsonContent = jsonMatch[1]
  }

  // Try to find JSON array or object
  const jsonArrayMatch = jsonContent.match(/\[[\s\S]*\]/)
  const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/)

  if (jsonArrayMatch) {
    jsonContent = jsonArrayMatch[0]
  } else if (jsonObjectMatch) {
    jsonContent = jsonObjectMatch[0]
  }

  try {
    const data = JSON.parse(jsonContent) as T
    return { data, response }
  } catch (parseError) {
    throw new Error(`Failed to parse JSON from Claude response: ${parseError}. Content: ${response.content.substring(0, 500)}`)
  }
}

/**
 * Get total cost for this session
 */
export function getSessionCost(): number {
  return totalCostThisSession
}

/**
 * Reset session cost tracker
 */
export function resetSessionCost(): void {
  totalCostThisSession = 0
}

/**
 * Check if cost limit is exceeded
 */
export function isCostLimitExceeded(): boolean {
  const limit = parseFloat(process.env.AI_REVIEW_COST_LIMIT || '1.0')
  return totalCostThisSession >= limit
}

/**
 * Get remaining rate limit requests
 */
export function getRemainingRequests(): number {
  const now = Date.now()
  const windowMs = 60 * 1000

  if (now - rateLimitState.windowStart > windowMs) {
    return parseInt(process.env.AI_REVIEW_RATE_LIMIT_PER_MINUTE || '10')
  }

  const limit = parseInt(process.env.AI_REVIEW_RATE_LIMIT_PER_MINUTE || '10')
  return Math.max(0, limit - rateLimitState.requests)
}

/**
 * Estimate cost for a given number of tokens
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model?: string
): number {
  const modelId = model || process.env.AI_REVIEW_MODEL || DEFAULT_AI_REVIEW_CONFIG.model
  return calculateCost(modelId, inputTokens, outputTokens)
}

/**
 * Count approximate tokens in text (rough estimate)
 * Claude uses ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
