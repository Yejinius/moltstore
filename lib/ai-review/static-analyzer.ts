/**
 * Static Code Analyzer
 * Uses Claude to analyze code for security vulnerabilities
 */

import { sendMessageForJSON, estimateTokens, isCostLimitExceeded } from './claude-client'
import { ExtractedFile, AIFinding, StaticAnalysisResult, FindingCategory, Severity } from './types'
import { groupFilesByPriority } from './file-extractor'

/**
 * System prompt for static analysis
 */
const STATIC_ANALYSIS_SYSTEM_PROMPT = `You are an expert security analyst reviewing code for an AI agent application marketplace.

Your task is to identify security vulnerabilities, malicious code patterns, and potential risks in the provided code.

## What to Look For

### Critical Issues (severity: "critical")
- Malware patterns: eval(), exec(), shell command execution with user input
- Backdoors: Hidden network connections, covert data exfiltration
- Credential theft: Attempts to access or transmit sensitive data
- Crypto mining code
- Ransomware patterns

### High Severity Issues (severity: "high")
- Hardcoded secrets: API keys, passwords, tokens, private keys
- SQL injection vulnerabilities
- Command injection vulnerabilities
- Path traversal vulnerabilities
- Unsafe deserialization
- Remote code execution risks

### Medium Severity Issues (severity: "medium")
- Cross-site scripting (XSS) vulnerabilities
- Insecure cryptographic practices
- Missing input validation
- Insecure random number generation
- Information disclosure

### Low Severity Issues (severity: "low")
- Code quality issues that may lead to security problems
- Missing error handling
- Deprecated or unsafe function usage
- Potential denial of service vectors

## Categories
Use these categories for findings:
- malware: Definite malicious code
- backdoor: Hidden or covert functionality
- secrets: Exposed credentials or keys
- vulnerability: Security vulnerability
- data_exfiltration: Unauthorized data transmission
- suspicious_behavior: Concerning but not definitively malicious

## Response Format
Return a JSON array of findings. Each finding must have:
{
  "severity": "critical" | "high" | "medium" | "low" | "info",
  "category": "malware" | "backdoor" | "secrets" | "vulnerability" | "data_exfiltration" | "suspicious_behavior",
  "title": "Brief title (max 100 chars)",
  "description": "Detailed explanation of the issue",
  "filePath": "path/to/file.js",
  "lineStart": 10,
  "lineEnd": 15,
  "codeSnippet": "the problematic code",
  "confidence": 0.95,
  "suggestion": "How to fix the issue"
}

If no issues are found, return an empty array: []

Be thorough but avoid false positives. Only report genuine security concerns.`

/**
 * Build analysis prompt for a batch of files
 */
function buildAnalysisPrompt(files: ExtractedFile[]): string {
  let prompt = 'Analyze the following code files for security vulnerabilities:\n\n'

  for (const file of files) {
    prompt += `## File: ${file.relativePath}\n`
    prompt += '```' + file.extension.replace('.', '') + '\n'
    prompt += file.content
    prompt += '\n```\n\n'
  }

  prompt += '\nReturn your findings as a JSON array.'

  return prompt
}

/**
 * Analyze a single file
 */
export async function analyzeFile(file: ExtractedFile): Promise<{
  findings: AIFinding[]
  tokensUsed: number
  processingTimeMs: number
}> {
  const prompt = buildAnalysisPrompt([file])

  const { data: findings, response } = await sendMessageForJSON<AIFinding[]>(prompt, {
    systemPrompt: STATIC_ANALYSIS_SYSTEM_PROMPT,
    maxTokens: 4096,
    temperature: 0
  })

  // Ensure all findings have the file path
  const processedFindings = findings.map(f => ({
    ...f,
    filePath: f.filePath || file.relativePath
  }))

  return {
    findings: processedFindings,
    tokensUsed: response.tokensUsed.total,
    processingTimeMs: response.processingTimeMs
  }
}

/**
 * Analyze a batch of files together
 */
export async function analyzeFileBatch(files: ExtractedFile[]): Promise<{
  findings: AIFinding[]
  tokensUsed: number
  processingTimeMs: number
}> {
  if (files.length === 0) {
    return { findings: [], tokensUsed: 0, processingTimeMs: 0 }
  }

  const prompt = buildAnalysisPrompt(files)

  const { data: findings, response } = await sendMessageForJSON<AIFinding[]>(prompt, {
    systemPrompt: STATIC_ANALYSIS_SYSTEM_PROMPT,
    maxTokens: 8192,
    temperature: 0
  })

  return {
    findings,
    tokensUsed: response.tokensUsed.total,
    processingTimeMs: response.processingTimeMs
  }
}

/**
 * Create batches of files that fit within token limits
 */
function createFileBatches(files: ExtractedFile[], maxTokensPerBatch: number = 50000): ExtractedFile[][] {
  const batches: ExtractedFile[][] = []
  let currentBatch: ExtractedFile[] = []
  let currentTokens = 0

  for (const file of files) {
    const fileTokens = estimateTokens(file.content) + 100 // Add buffer for formatting

    if (currentTokens + fileTokens > maxTokensPerBatch && currentBatch.length > 0) {
      batches.push(currentBatch)
      currentBatch = []
      currentTokens = 0
    }

    currentBatch.push(file)
    currentTokens += fileTokens
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch)
  }

  return batches
}

/**
 * Calculate security score from findings
 */
function calculateScore(findings: AIFinding[]): number {
  let deductions = 0

  for (const finding of findings) {
    const confidence = finding.confidence || 0.8

    switch (finding.severity) {
      case 'critical':
        deductions += 40 * confidence
        break
      case 'high':
        deductions += 25 * confidence
        break
      case 'medium':
        deductions += 10 * confidence
        break
      case 'low':
        deductions += 3 * confidence
        break
      case 'info':
        deductions += 0
        break
    }
  }

  return Math.max(0, Math.round(100 - deductions))
}

/**
 * Generate summary from findings
 */
function generateSummary(findings: AIFinding[], score: number): string {
  if (findings.length === 0) {
    return 'No security issues detected. The code appears to be safe.'
  }

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const highCount = findings.filter(f => f.severity === 'high').length
  const mediumCount = findings.filter(f => f.severity === 'medium').length
  const lowCount = findings.filter(f => f.severity === 'low').length

  const parts: string[] = []

  if (criticalCount > 0) {
    parts.push(`${criticalCount} critical issue(s) found - immediate attention required`)
  }
  if (highCount > 0) {
    parts.push(`${highCount} high severity issue(s)`)
  }
  if (mediumCount > 0) {
    parts.push(`${mediumCount} medium severity issue(s)`)
  }
  if (lowCount > 0) {
    parts.push(`${lowCount} low severity issue(s)`)
  }

  const categories = [...new Set(findings.map(f => f.category))]
  const categoryStr = categories.join(', ')

  return `Security score: ${score}/100. ${parts.join(', ')}. Categories: ${categoryStr}.`
}

/**
 * Run full static analysis on extracted files
 */
export async function runStaticAnalysis(files: ExtractedFile[]): Promise<StaticAnalysisResult> {
  const startTime = Date.now()
  const allFindings: AIFinding[] = []
  let totalTokens = 0

  // Group files by priority
  const { highPriority, mediumPriority, lowPriority } = groupFilesByPriority(files)

  // Prioritize analysis order
  const orderedFiles = [...highPriority, ...mediumPriority, ...lowPriority]

  // Create batches
  const batches = createFileBatches(orderedFiles)

  console.log(`Static analysis: ${files.length} files in ${batches.length} batches`)

  // Analyze each batch
  for (let i = 0; i < batches.length; i++) {
    // Check cost limit before each batch
    if (isCostLimitExceeded()) {
      console.warn('Cost limit exceeded, stopping analysis early')
      break
    }

    try {
      const batch = batches[i]
      console.log(`Analyzing batch ${i + 1}/${batches.length}: ${batch.length} files`)

      const result = await analyzeFileBatch(batch)
      allFindings.push(...result.findings)
      totalTokens += result.tokensUsed
    } catch (error) {
      console.error(`Error analyzing batch ${i + 1}:`, error)
      // Continue with other batches
    }
  }

  // Calculate score and generate summary
  const score = calculateScore(allFindings)
  const summary = generateSummary(allFindings, score)
  const processingTimeMs = Date.now() - startTime

  return {
    findings: allFindings,
    score,
    summary,
    tokensUsed: totalTokens,
    processingTimeMs
  }
}

/**
 * Quick scan for obvious malware patterns (no AI, fast check)
 */
export function quickMalwareScan(files: ExtractedFile[]): AIFinding[] {
  const findings: AIFinding[] = []

  const malwarePatterns = [
    { pattern: /eval\s*\(\s*atob\s*\(/, category: 'malware' as FindingCategory, title: 'Obfuscated eval detected' },
    { pattern: /new\s+Function\s*\(\s*['"`]return\s+this/, category: 'malware' as FindingCategory, title: 'Suspicious Function constructor' },
    { pattern: /crypto\.createCipheriv.*['"`]aes/, category: 'suspicious_behavior' as FindingCategory, title: 'Encryption usage detected' },
    { pattern: /child_process|exec\s*\(|spawn\s*\(/, category: 'vulnerability' as FindingCategory, title: 'Shell command execution' },
    { pattern: /process\.env\.[A-Z_]+.*=/, category: 'suspicious_behavior' as FindingCategory, title: 'Environment variable modification' },
    { pattern: /\.cookie\s*=|document\.cookie/, category: 'suspicious_behavior' as FindingCategory, title: 'Cookie manipulation' },
    { pattern: /sk[-_]live[-_]|pk[-_]live[-_]|ghp_|gho_/, category: 'secrets' as FindingCategory, title: 'Potential API key detected' },
    { pattern: /password\s*[:=]\s*['"`][^'"` ]{8,}/, category: 'secrets' as FindingCategory, title: 'Hardcoded password detected' },
    { pattern: /BEGIN\s+(RSA\s+)?PRIVATE\s+KEY/, category: 'secrets' as FindingCategory, title: 'Private key detected' },
  ]

  for (const file of files) {
    for (const { pattern, category, title } of malwarePatterns) {
      const matches = file.content.match(new RegExp(pattern, 'gi'))
      if (matches) {
        // Find line number
        const lines = file.content.split('\n')
        let lineStart = 1
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            lineStart = i + 1
            break
          }
        }

        findings.push({
          severity: category === 'malware' ? 'critical' : category === 'secrets' ? 'high' : 'medium',
          category,
          title,
          description: `Pattern matched: ${pattern.toString()}`,
          filePath: file.relativePath,
          lineStart,
          confidence: 0.7,
          suggestion: 'Review this code manually for potential security issues'
        })
      }
    }
  }

  return findings
}
