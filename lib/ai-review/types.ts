/**
 * AI Code Review System - Type Definitions
 */

// Finding severity levels
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

// Finding categories
export type FindingCategory =
  | 'malware'
  | 'backdoor'
  | 'secrets'
  | 'vulnerability'
  | 'prompt_injection'
  | 'permission_violation'
  | 'data_exfiltration'
  | 'code_quality'
  | 'suspicious_behavior'

// Review status
export type ReviewStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'

// Recommendation
export type Recommendation = 'approve' | 'reject' | 'manual_review'

/**
 * Individual finding from AI analysis
 */
export interface AIFinding {
  severity: Severity
  category: FindingCategory
  title: string
  description: string
  filePath?: string
  lineStart?: number
  lineEnd?: number
  codeSnippet?: string
  confidence: number // 0-1
  suggestion?: string
}

/**
 * Extracted file from uploaded archive
 */
export interface ExtractedFile {
  path: string
  relativePath: string
  content: string
  hash: string
  size: number
  extension: string
  isCodeFile: boolean
}

/**
 * Static analysis result from Claude
 */
export interface StaticAnalysisResult {
  findings: AIFinding[]
  score: number
  summary: string
  tokensUsed: number
  processingTimeMs: number
}

/**
 * Agent safety analysis result
 */
export interface AgentSafetyResult {
  promptInjectionRisks: AIFinding[]
  permissionViolations: AIFinding[]
  suspiciousBehaviors: AIFinding[]
  declaredPermissions: string[]
  actualPermissions: string[]
  score: number
  summary: string
  tokensUsed: number
}

/**
 * Sandbox test result
 */
export interface SandboxResult {
  passed: boolean
  networkRequests: {
    host: string
    port: number
    protocol: string
    blocked: boolean
    suspicious: boolean
  }[]
  fileAccess: {
    path: string
    operation: 'read' | 'write' | 'delete'
    allowed: boolean
  }[]
  processSpawned: {
    command: string
    blocked: boolean
  }[]
  resourceUsage: {
    cpuPercent: number
    memoryMb: number
    diskMb: number
  }
  findings: AIFinding[]
  score: number
  executionTimeMs: number
}

/**
 * Complete AI review result
 */
export interface AIReviewResult {
  id: number
  appId: string
  fileHash: string
  status: ReviewStatus

  // Scores (0-100)
  overallScore: number
  securityScore: number
  codeQualityScore?: number
  agentSafetyScore?: number
  sandboxScore?: number

  // Analysis results
  staticAnalysis?: StaticAnalysisResult
  agentSafetyAnalysis?: AgentSafetyResult
  sandboxAnalysis?: SandboxResult

  // Aggregated findings
  findings: AIFinding[]
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number

  // Decision
  recommendation: Recommendation
  summary: string

  // Metadata
  tokensUsed: number
  costEstimate: number
  processingTimeMs: number
  errorMessage?: string

  createdAt: Date
  completedAt?: Date
}

/**
 * AI review configuration
 */
export interface AIReviewConfig {
  enabled: boolean
  autoTrigger: boolean
  model: string

  // File limits
  maxFileSizeKb: number
  maxTotalSizeKb: number
  maxFilesPerApp: number

  // Thresholds
  approveThreshold: number
  rejectThreshold: number

  // Cost limits
  costLimitPerReview: number

  // Rate limits
  rateLimitPerMinute: number

  // File filtering
  excludedExtensions: string[]
  includedExtensions: string[]

  // Sandbox
  sandboxEnabled: boolean
  sandboxTimeoutSeconds: number
  sandboxMemoryLimit: string
  sandboxCpuLimit: number
}

/**
 * Claude API request options
 */
export interface ClaudeRequestOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

/**
 * Claude API response
 */
export interface ClaudeResponse {
  content: string
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  cost: number
  processingTimeMs: number
}

/**
 * File analysis cache entry
 */
export interface FileAnalysisCache {
  fileHash: string
  analysis: StaticAnalysisResult
  analyzedAt: Date
}

/**
 * Database types for AI review
 */
export interface DbAIReview {
  id: number
  app_id: string
  file_hash: string
  status: ReviewStatus
  overall_score: number | null
  security_score: number | null
  code_quality_score: number | null
  agent_safety_score: number | null
  sandbox_score: number | null
  static_analysis: string | null // JSON
  agent_safety_analysis: string | null // JSON
  sandbox_analysis: string | null // JSON
  findings: string | null // JSON
  recommendation: Recommendation | null
  summary: string | null
  tokens_used: number | null
  cost_estimate: number | null
  processing_time_ms: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface DbFileAnalysisCache {
  id: number
  file_hash: string
  file_path: string
  file_type: string
  analysis: string // JSON
  findings: string | null // JSON
  tokens_used: number | null
  analyzed_at: string
}

export interface DbAIFinding {
  id: number
  ai_review_id: number
  severity: Severity
  category: FindingCategory
  title: string
  description: string
  file_path: string | null
  line_start: number | null
  line_end: number | null
  code_snippet: string | null
  confidence: number
  suggestion: string | null
  created_at: string
}

/**
 * Default configuration
 */
export const DEFAULT_AI_REVIEW_CONFIG: AIReviewConfig = {
  enabled: true,
  autoTrigger: true,
  model: 'claude-opus-4-20250514',

  maxFileSizeKb: 500,
  maxTotalSizeKb: 5000,
  maxFilesPerApp: 100,

  approveThreshold: 80,
  rejectThreshold: 40,

  costLimitPerReview: 1.0,
  rateLimitPerMinute: 10,

  excludedExtensions: [
    '.min.js', '.min.css', '.bundle.js', '.map',
    '.lock', '.log', '.svg', '.png', '.jpg', '.jpeg',
    '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot',
    '.mp3', '.mp4', '.wav', '.avi', '.mov', '.pdf',
    '.zip', '.tar', '.gz', '.rar', '.7z'
  ],

  includedExtensions: [
    '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs',
    '.py', '.rb', '.go', '.rs', '.java', '.kt',
    '.php', '.cs', '.cpp', '.c', '.h', '.hpp',
    '.swift', '.m', '.vue', '.svelte',
    '.json', '.yaml', '.yml', '.toml', '.xml',
    '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd',
    '.sql', '.graphql', '.prisma',
    '.env.example', '.env.sample',
    '.md', '.txt', '.rst'
  ],

  sandboxEnabled: true,
  sandboxTimeoutSeconds: 60,
  sandboxMemoryLimit: '512m',
  sandboxCpuLimit: 0.5
}

/**
 * Severity weights for scoring
 */
export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 40,
  high: 25,
  medium: 15,
  low: 5,
  info: 0
}

/**
 * Model pricing (per 1M tokens)
 */
export const MODEL_PRICING = {
  'claude-opus-4-20250514': { input: 15, output: 75 },
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-haiku-3-5-20241022': { input: 0.25, output: 1.25 }
} as const
