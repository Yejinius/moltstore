/**
 * AI Code Review System
 * Main entry point and high-level API
 */

import { extractArchive, cleanupTempDir, getFileStats } from './file-extractor'
import { runStaticAnalysis, quickMalwareScan } from './static-analyzer'
import { runAgentSafetyAnalysis, quickAgentSafetyCheck } from './agent-safety-analyzer'
import { aggregateResults, getRecommendation, formatFindingsForDisplay } from './scoring-engine'
import { getSessionCost, resetSessionCost, isCostLimitExceeded } from './claude-client'
import {
  AIReviewResult,
  AIReviewConfig,
  DEFAULT_AI_REVIEW_CONFIG,
  ReviewStatus,
  Recommendation,
  AgentSafetyResult
} from './types'

// Re-export types
export * from './types'

// Re-export utilities
export { getSessionCost, resetSessionCost, formatFindingsForDisplay }

/**
 * Get current AI review configuration
 */
export function getConfig(): AIReviewConfig {
  return {
    enabled: process.env.ENABLE_AI_REVIEW === 'true',
    autoTrigger: process.env.AI_REVIEW_AUTO_TRIGGER === 'true',
    model: process.env.AI_REVIEW_MODEL || DEFAULT_AI_REVIEW_CONFIG.model,
    maxFileSizeKb: parseInt(process.env.AI_REVIEW_MAX_FILE_SIZE_KB || String(DEFAULT_AI_REVIEW_CONFIG.maxFileSizeKb)),
    maxTotalSizeKb: parseInt(process.env.AI_REVIEW_MAX_TOTAL_SIZE_KB || String(DEFAULT_AI_REVIEW_CONFIG.maxTotalSizeKb)),
    maxFilesPerApp: DEFAULT_AI_REVIEW_CONFIG.maxFilesPerApp,
    approveThreshold: parseInt(process.env.AI_REVIEW_APPROVE_THRESHOLD || String(DEFAULT_AI_REVIEW_CONFIG.approveThreshold)),
    rejectThreshold: parseInt(process.env.AI_REVIEW_REJECT_THRESHOLD || String(DEFAULT_AI_REVIEW_CONFIG.rejectThreshold)),
    costLimitPerReview: parseFloat(process.env.AI_REVIEW_COST_LIMIT || String(DEFAULT_AI_REVIEW_CONFIG.costLimitPerReview)),
    rateLimitPerMinute: parseInt(process.env.AI_REVIEW_RATE_LIMIT_PER_MINUTE || '10'),
    excludedExtensions: DEFAULT_AI_REVIEW_CONFIG.excludedExtensions,
    includedExtensions: DEFAULT_AI_REVIEW_CONFIG.includedExtensions,
    sandboxEnabled: process.env.DOCKER_SANDBOX_ENABLED === 'true',
    sandboxTimeoutSeconds: parseInt(process.env.SANDBOX_TIMEOUT_SECONDS || '60'),
    sandboxMemoryLimit: process.env.SANDBOX_MEMORY_LIMIT || '512m',
    sandboxCpuLimit: parseFloat(process.env.SANDBOX_CPU_LIMIT || '0.5')
  }
}

/**
 * Check if AI review is enabled
 */
export function isEnabled(): boolean {
  return process.env.ENABLE_AI_REVIEW === 'true' && !!process.env.ANTHROPIC_API_KEY
}

/**
 * Run full AI code review on an uploaded app
 */
export async function runAIReview(
  appId: string,
  archivePath: string,
  fileHash: string
): Promise<AIReviewResult> {
  const startTime = Date.now()

  // Check if enabled
  if (!isEnabled()) {
    throw new Error('AI review is not enabled. Set ENABLE_AI_REVIEW=true and provide ANTHROPIC_API_KEY.')
  }

  // Reset cost tracker for this review
  resetSessionCost()

  let extractDir: string | null = null

  try {
    console.log(`Starting AI review for app ${appId}`)

    // Step 1: Extract archive
    console.log('Extracting archive...')
    const { files, extractDir: dir, totalSize } = await extractArchive(archivePath)
    extractDir = dir

    const stats = getFileStats(files)
    console.log(`Extracted ${stats.totalFiles} files (${Math.round(stats.totalSize / 1024)}KB)`)

    if (files.length === 0) {
      return {
        id: 0,
        appId,
        fileHash,
        status: 'completed',
        overallScore: 100,
        securityScore: 100,
        codeQualityScore: 100,
        agentSafetyScore: undefined,
        sandboxScore: undefined,
        findings: [],
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        recommendation: 'approve',
        summary: 'No code files found to analyze.',
        tokensUsed: 0,
        costEstimate: 0,
        processingTimeMs: Date.now() - startTime,
        createdAt: new Date()
      }
    }

    // Step 2: Quick malware scan (fast, no AI)
    console.log('Running quick malware scan...')
    const quickFindings = quickMalwareScan(files)

    if (quickFindings.some(f => f.severity === 'critical' && f.category === 'malware')) {
      console.log('Critical malware detected in quick scan, rejecting immediately')
      return {
        id: 0,
        appId,
        fileHash,
        status: 'completed',
        overallScore: 0,
        securityScore: 0,
        codeQualityScore: 0,
        agentSafetyScore: undefined,
        sandboxScore: undefined,
        findings: quickFindings,
        criticalCount: quickFindings.filter(f => f.severity === 'critical').length,
        highCount: quickFindings.filter(f => f.severity === 'high').length,
        mediumCount: quickFindings.filter(f => f.severity === 'medium').length,
        lowCount: quickFindings.filter(f => f.severity === 'low').length,
        recommendation: 'reject',
        summary: 'Critical malware patterns detected. This app has been automatically rejected.',
        tokensUsed: 0,
        costEstimate: 0,
        processingTimeMs: Date.now() - startTime,
        createdAt: new Date()
      }
    }

    // Step 3: AI Static Analysis
    console.log('Running AI static analysis...')
    const staticAnalysis = await runStaticAnalysis(files)
    console.log(`Static analysis complete: score ${staticAnalysis.score}, ${staticAnalysis.findings.length} findings`)

    // Check cost limit before agent safety
    if (isCostLimitExceeded()) {
      console.warn('Cost limit exceeded, skipping agent safety analysis')
    }

    // Step 4: Agent Safety Analysis
    let agentSafetyResult: AgentSafetyResult | undefined = undefined
    if (!isCostLimitExceeded()) {
      console.log('Running agent safety analysis...')
      try {
        agentSafetyResult = await runAgentSafetyAnalysis(files)
        console.log(`Agent safety analysis complete: score ${agentSafetyResult.score}`)
      } catch (error) {
        console.error('Agent safety analysis failed:', error)
      }
    }

    // Step 5: Aggregate results
    const result = aggregateResults(appId, fileHash, staticAnalysis, agentSafetyResult)

    // Add quick scan findings
    result.findings = [...quickFindings, ...(result.findings || [])]

    // Recalculate counts
    const findings = result.findings || []
    result.criticalCount = findings.filter(f => f.severity === 'critical').length
    result.highCount = findings.filter(f => f.severity === 'high').length
    result.mediumCount = findings.filter(f => f.severity === 'medium').length
    result.lowCount = findings.filter(f => f.severity === 'low').length

    // Add cost estimate
    result.costEstimate = getSessionCost()
    result.processingTimeMs = Date.now() - startTime
    result.createdAt = new Date()

    console.log(`AI review complete: score ${result.overallScore}, recommendation: ${result.recommendation}`)

    return result as AIReviewResult

  } finally {
    // Cleanup
    if (extractDir) {
      await cleanupTempDir(extractDir)
    }
  }
}

/**
 * Run a quick review (pattern matching only, no AI)
 */
export async function runQuickReview(
  appId: string,
  archivePath: string,
  fileHash: string
): Promise<Partial<AIReviewResult>> {
  const startTime = Date.now()
  let extractDir: string | null = null

  try {
    const { files, extractDir: dir } = await extractArchive(archivePath)
    extractDir = dir

    const findings = quickMalwareScan(files)
    const score = findings.length === 0 ? 100 :
      findings.some(f => f.severity === 'critical') ? 0 :
      findings.some(f => f.severity === 'high') ? 30 : 60

    return {
      appId,
      fileHash,
      status: 'completed',
      overallScore: score,
      securityScore: score,
      findings,
      recommendation: getRecommendation(score),
      summary: findings.length === 0
        ? 'Quick scan passed.'
        : `Quick scan found ${findings.length} potential issue(s).`,
      processingTimeMs: Date.now() - startTime
    }

  } finally {
    if (extractDir) {
      await cleanupTempDir(extractDir)
    }
  }
}

/**
 * Check if an app needs AI review based on basic security score
 */
export function shouldTriggerAIReview(basicSecurityScore: number): boolean {
  const config = getConfig()

  if (!config.enabled || !config.autoTrigger) {
    return false
  }

  // Always review if basic score is below approve threshold
  if (basicSecurityScore < config.approveThreshold) {
    return true
  }

  // Random sampling for high-scoring apps (10% chance)
  return Math.random() < 0.1
}
