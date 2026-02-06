/**
 * Scoring Engine
 * Calculates final scores and makes recommendations
 */

import {
  AIFinding,
  AIReviewResult,
  StaticAnalysisResult,
  AgentSafetyResult,
  SandboxResult,
  Recommendation,
  SEVERITY_WEIGHTS,
  DEFAULT_AI_REVIEW_CONFIG
} from './types'

/**
 * Calculate score from findings
 */
export function calculateScoreFromFindings(findings: AIFinding[]): number {
  let deductions = 0

  for (const finding of findings) {
    const confidence = finding.confidence || 0.8
    const weight = SEVERITY_WEIGHTS[finding.severity] || 0
    deductions += weight * confidence
  }

  return Math.max(0, Math.round(100 - deductions))
}

/**
 * Count findings by severity
 */
export function countFindingsBySeverity(findings: AIFinding[]): {
  critical: number
  high: number
  medium: number
  low: number
  info: number
} {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length
  }
}

/**
 * Determine recommendation based on score
 */
export function getRecommendation(score: number): Recommendation {
  const config = DEFAULT_AI_REVIEW_CONFIG

  const approveThreshold = parseInt(process.env.AI_REVIEW_APPROVE_THRESHOLD || String(config.approveThreshold))
  const rejectThreshold = parseInt(process.env.AI_REVIEW_REJECT_THRESHOLD || String(config.rejectThreshold))

  if (score >= approveThreshold) {
    return 'approve'
  } else if (score < rejectThreshold) {
    return 'reject'
  } else {
    return 'manual_review'
  }
}

/**
 * Check if there are any critical findings that should force rejection
 */
export function hasCriticalFindings(findings: AIFinding[]): boolean {
  return findings.some(f =>
    f.severity === 'critical' &&
    (f.category === 'malware' || f.category === 'backdoor') &&
    (f.confidence || 0) >= 0.8
  )
}

/**
 * Calculate weighted overall score from component scores
 */
export function calculateOverallScore(
  securityScore: number,
  codeQualityScore: number,
  agentSafetyScore?: number,
  sandboxScore?: number
): number {
  // Weights for each component
  const weights = {
    security: 0.5,
    codeQuality: 0.15,
    agentSafety: 0.2,
    sandbox: 0.15
  }

  let totalWeight = weights.security + weights.codeQuality
  let weightedSum = securityScore * weights.security + codeQualityScore * weights.codeQuality

  if (agentSafetyScore !== undefined) {
    totalWeight += weights.agentSafety
    weightedSum += agentSafetyScore * weights.agentSafety
  }

  if (sandboxScore !== undefined) {
    totalWeight += weights.sandbox
    weightedSum += sandboxScore * weights.sandbox
  }

  return Math.round(weightedSum / totalWeight)
}

/**
 * Generate human-readable summary
 */
export function generateSummary(
  findings: AIFinding[],
  overallScore: number,
  recommendation: Recommendation
): string {
  const counts = countFindingsBySeverity(findings)
  const parts: string[] = []

  // Overall assessment
  if (recommendation === 'approve') {
    parts.push('This app passed security review.')
  } else if (recommendation === 'reject') {
    parts.push('This app failed security review due to serious issues.')
  } else {
    parts.push('This app requires manual review.')
  }

  // Finding counts
  const issuesParts: string[] = []
  if (counts.critical > 0) issuesParts.push(`${counts.critical} critical`)
  if (counts.high > 0) issuesParts.push(`${counts.high} high`)
  if (counts.medium > 0) issuesParts.push(`${counts.medium} medium`)
  if (counts.low > 0) issuesParts.push(`${counts.low} low`)

  if (issuesParts.length > 0) {
    parts.push(`Found ${issuesParts.join(', ')} severity issue(s).`)
  } else {
    parts.push('No security issues detected.')
  }

  // Score
  parts.push(`Overall score: ${overallScore}/100.`)

  // Top issues summary
  const topIssues = findings
    .filter(f => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 3)

  if (topIssues.length > 0) {
    parts.push('Key issues:')
    for (const issue of topIssues) {
      parts.push(`- ${issue.title}`)
    }
  }

  return parts.join(' ')
}

/**
 * Aggregate results from all analysis phases
 */
export function aggregateResults(
  appId: string,
  fileHash: string,
  staticAnalysis?: StaticAnalysisResult,
  agentSafetyAnalysis?: AgentSafetyResult,
  sandboxAnalysis?: SandboxResult
): Partial<AIReviewResult> {
  // Collect all findings
  const allFindings: AIFinding[] = []

  if (staticAnalysis) {
    allFindings.push(...staticAnalysis.findings)
  }

  if (agentSafetyAnalysis) {
    allFindings.push(...agentSafetyAnalysis.promptInjectionRisks)
    allFindings.push(...agentSafetyAnalysis.permissionViolations)
    allFindings.push(...agentSafetyAnalysis.suspiciousBehaviors)
  }

  if (sandboxAnalysis) {
    allFindings.push(...sandboxAnalysis.findings)
  }

  // Calculate component scores
  const securityScore = staticAnalysis?.score ?? 100
  const codeQualityScore = staticAnalysis ? Math.min(100, staticAnalysis.score + 10) : 100 // Slightly higher
  const agentSafetyScore = agentSafetyAnalysis?.score
  const sandboxScore = sandboxAnalysis?.score

  // Calculate overall score
  const overallScore = calculateOverallScore(
    securityScore,
    codeQualityScore,
    agentSafetyScore,
    sandboxScore
  )

  // Check for critical findings that force rejection
  const hasCritical = hasCriticalFindings(allFindings)
  let recommendation = getRecommendation(overallScore)

  // Override recommendation for critical findings
  if (hasCritical && recommendation !== 'reject') {
    recommendation = 'reject'
  }

  // Generate summary
  const summary = generateSummary(allFindings, overallScore, recommendation)

  // Count findings
  const counts = countFindingsBySeverity(allFindings)

  // Calculate totals
  const tokensUsed = (staticAnalysis?.tokensUsed ?? 0) + (agentSafetyAnalysis?.tokensUsed ?? 0)
  const processingTimeMs = (staticAnalysis?.processingTimeMs ?? 0)

  return {
    appId,
    fileHash,
    status: 'completed',
    overallScore,
    securityScore,
    codeQualityScore,
    agentSafetyScore,
    sandboxScore,
    staticAnalysis,
    agentSafetyAnalysis,
    sandboxAnalysis,
    findings: allFindings,
    criticalCount: counts.critical,
    highCount: counts.high,
    mediumCount: counts.medium,
    lowCount: counts.low,
    recommendation,
    summary,
    tokensUsed,
    processingTimeMs
  }
}

/**
 * Format findings for display
 */
export function formatFindingsForDisplay(findings: AIFinding[]): string {
  if (findings.length === 0) {
    return 'No issues found.'
  }

  const lines: string[] = []

  // Group by severity
  const bySeverity = {
    critical: findings.filter(f => f.severity === 'critical'),
    high: findings.filter(f => f.severity === 'high'),
    medium: findings.filter(f => f.severity === 'medium'),
    low: findings.filter(f => f.severity === 'low'),
    info: findings.filter(f => f.severity === 'info')
  }

  for (const [severity, items] of Object.entries(bySeverity)) {
    if (items.length === 0) continue

    lines.push(`\n## ${severity.toUpperCase()} (${items.length})`)

    for (const finding of items) {
      lines.push(`\n### ${finding.title}`)
      lines.push(`- **Category:** ${finding.category}`)
      lines.push(`- **Confidence:** ${Math.round((finding.confidence || 0) * 100)}%`)
      if (finding.filePath) {
        lines.push(`- **Location:** ${finding.filePath}${finding.lineStart ? `:${finding.lineStart}` : ''}`)
      }
      lines.push(`- **Description:** ${finding.description}`)
      if (finding.suggestion) {
        lines.push(`- **Suggestion:** ${finding.suggestion}`)
      }
    }
  }

  return lines.join('\n')
}
