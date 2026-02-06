/**
 * Agent Safety Analyzer
 * Analyzes AI agent apps for safety issues including:
 * - Prompt injection vulnerabilities
 * - Permission violations
 * - Deceptive behaviors
 * - Undeclared capabilities
 */

import { sendMessageForJSON } from './claude-client'
import {
  AIFinding,
  AgentSafetyResult,
  ExtractedFile,
  Severity,
  FindingCategory
} from './types'

// System prompt for agent safety analysis
const AGENT_SAFETY_SYSTEM_PROMPT = `You are an expert AI safety analyst specializing in LLM-based applications.

Your task is to analyze code for AI agent safety issues. Focus on:

1. **Prompt Injection Vulnerabilities**
   - User input passed directly to LLM without sanitization
   - Dynamic prompt construction from external sources
   - Lack of input validation before LLM calls
   - Missing system prompt protection

2. **Permission Violations**
   - File system access beyond declared scope
   - Network requests to undeclared endpoints
   - Environment variable access for sensitive data
   - Subprocess execution capabilities
   - Database access without proper authorization

3. **Deceptive Behaviors**
   - Hidden functionality not mentioned in documentation
   - Responses that masquerade as system messages
   - Data collection without user consent
   - Modification of user-facing outputs

4. **Undeclared Capabilities**
   - Tool calls that exceed stated permissions
   - Hidden API integrations
   - Stealth data transmission
   - Background processes

For each issue found, provide:
- severity: "critical" | "high" | "medium" | "low"
- category: "prompt_injection" | "permission_violation" | "data_exfiltration" | "suspicious_behavior"
- title: Brief title
- description: Detailed explanation of the risk
- filePath: File where issue was found
- lineStart: Starting line number (if applicable)
- codeSnippet: Relevant code (max 200 chars)
- confidence: 0.0-1.0
- suggestion: How to fix

Respond ONLY with valid JSON in this format:
{
  "findings": [...],
  "declaredPermissions": ["permission1", "permission2"],
  "actualPermissions": ["permission1", "permission2", "permission3"],
  "summary": "Brief overall assessment",
  "score": 0-100
}`

/**
 * Quick pattern-based check for common agent safety issues
 */
export function quickAgentSafetyCheck(files: ExtractedFile[]): AIFinding[] {
  const findings: AIFinding[] = []

  // Patterns indicating prompt injection risks
  const promptInjectionPatterns = [
    { pattern: /\$\{.*user.*input.*\}/gi, title: 'Direct user input in template literal' },
    { pattern: /\+\s*user\w*Input/gi, title: 'String concatenation with user input' },
    { pattern: /f["'].*\{.*user.*\}/gi, title: 'F-string with user input (Python)' },
    { pattern: /messages\s*:\s*\[\s*\{[^}]*content\s*:\s*[^"'`\[]/gi, title: 'Dynamic message content' },
    { pattern: /prompt\s*[=+]\s*(?!["'`])/gi, title: 'Dynamic prompt construction' },
  ]

  // Patterns indicating permission issues
  const permissionPatterns = [
    { pattern: /child_process|spawn|exec(?!ute)/gi, title: 'Process execution capability' },
    { pattern: /fs\.(read|write|unlink|rmdir)|readFileSync|writeFileSync/gi, title: 'File system access' },
    { pattern: /fetch\s*\(|axios|http\.request|urllib/gi, title: 'Network request capability' },
    { pattern: /process\.env\[\s*['"`](?!NODE_ENV|DEBUG)/gi, title: 'Environment variable access' },
    { pattern: /eval\s*\(|Function\s*\(|new\s+Function/gi, title: 'Dynamic code evaluation' },
  ]

  // Patterns indicating deceptive behavior
  const deceptivePatterns = [
    { pattern: /system\s*:\s*['"`](?!You are)/gi, title: 'Custom system message injection' },
    { pattern: /role\s*:\s*['"`]system['"`]/gi, title: 'System role manipulation' },
    { pattern: /fake|spoof|impersonat|disguise/gi, title: 'Potential deceptive behavior' },
    { pattern: /localStorage|sessionStorage|indexedDB/gi, title: 'Browser storage access' },
    { pattern: /document\.cookie|setCookie/gi, title: 'Cookie access' },
  ]

  for (const file of files) {
    const lines = file.content.split('\n')

    // Check prompt injection patterns
    for (const { pattern, title } of promptInjectionPatterns) {
      const matches = file.content.match(pattern)
      if (matches) {
        for (const match of matches) {
          const lineNum = findLineNumber(file.content, match)
          findings.push({
            severity: 'high',
            category: 'prompt_injection',
            title,
            description: `Potential prompt injection vulnerability detected. User input may be passed to LLM without proper sanitization.`,
            filePath: file.relativePath,
            lineStart: lineNum,
            codeSnippet: truncate(match, 100),
            confidence: 0.7,
            suggestion: 'Sanitize user input before including in prompts. Use allow-lists and validate input format.'
          })
        }
      }
    }

    // Check permission patterns
    for (const { pattern, title } of permissionPatterns) {
      const matches = file.content.match(pattern)
      if (matches) {
        for (const match of matches) {
          const lineNum = findLineNumber(file.content, match)
          findings.push({
            severity: 'medium',
            category: 'permission_violation',
            title,
            description: `Code uses ${title.toLowerCase()} which may need explicit permission declaration.`,
            filePath: file.relativePath,
            lineStart: lineNum,
            codeSnippet: truncate(match, 100),
            confidence: 0.8,
            suggestion: 'Declare this capability in your app manifest and ensure proper access controls.'
          })
        }
      }
    }

    // Check deceptive patterns
    for (const { pattern, title } of deceptivePatterns) {
      const matches = file.content.match(pattern)
      if (matches) {
        for (const match of matches) {
          const lineNum = findLineNumber(file.content, match)
          findings.push({
            severity: 'high',
            category: 'suspicious_behavior',
            title,
            description: `${title} detected which could indicate deceptive or misleading functionality.`,
            filePath: file.relativePath,
            lineStart: lineNum,
            codeSnippet: truncate(match, 100),
            confidence: 0.6,
            suggestion: 'Review this code carefully. Ensure all behaviors are transparent and documented.'
          })
        }
      }
    }
  }

  return findings
}

/**
 * AI-powered deep analysis of agent safety
 */
export async function runAgentSafetyAnalysis(files: ExtractedFile[]): Promise<AgentSafetyResult> {
  const startTime = Date.now()

  // First, do quick pattern-based scan
  const quickFindings = quickAgentSafetyCheck(files)

  // If critical issues found in quick scan, return early
  if (quickFindings.some(f => f.severity === 'critical')) {
    return {
      promptInjectionRisks: quickFindings.filter(f => f.category === 'prompt_injection'),
      permissionViolations: quickFindings.filter(f => f.category === 'permission_violation'),
      suspiciousBehaviors: quickFindings.filter(f => f.category === 'suspicious_behavior'),
      declaredPermissions: [],
      actualPermissions: extractActualPermissions(files),
      score: 20,
      summary: 'Critical agent safety issues detected in quick scan.',
      tokensUsed: 0
    }
  }

  // Filter to files likely to contain agent logic
  const agentFiles = files.filter(f =>
    f.relativePath.toLowerCase().includes('agent') ||
    f.relativePath.toLowerCase().includes('llm') ||
    f.relativePath.toLowerCase().includes('ai') ||
    f.relativePath.toLowerCase().includes('chat') ||
    f.relativePath.toLowerCase().includes('prompt') ||
    f.relativePath.toLowerCase().includes('api') ||
    f.relativePath.toLowerCase().includes('handler') ||
    f.content.toLowerCase().includes('openai') ||
    f.content.toLowerCase().includes('anthropic') ||
    f.content.toLowerCase().includes('langchain') ||
    f.content.toLowerCase().includes('llama')
  )

  // If no agent-related files, return clean result
  if (agentFiles.length === 0) {
    return {
      promptInjectionRisks: [],
      permissionViolations: [],
      suspiciousBehaviors: [],
      declaredPermissions: [],
      actualPermissions: extractActualPermissions(files),
      score: 100,
      summary: 'No AI agent code detected. App does not appear to use LLM capabilities.',
      tokensUsed: 0
    }
  }

  // Prepare code for AI analysis (limit to most relevant files)
  const filesToAnalyze = agentFiles.slice(0, 10)
  const codeContent = filesToAnalyze
    .map(f => `### File: ${f.relativePath}\n\`\`\`\n${truncate(f.content, 3000)}\n\`\`\``)
    .join('\n\n')

  try {
    const response = await sendMessageForJSON<{
      findings: AIFinding[]
      declaredPermissions: string[]
      actualPermissions: string[]
      summary: string
      score: number
    }>(
      `Analyze these AI agent-related files for safety issues:\n\n${codeContent}`,
      {
        systemPrompt: AGENT_SAFETY_SYSTEM_PROMPT,
        maxTokens: 4096,
        temperature: 0.1
      }
    )

    // Combine quick scan findings with AI findings
    const allFindings = [...quickFindings, ...(response.data.findings || [])]

    // Deduplicate findings by file and title
    const uniqueFindings = deduplicateFindings(allFindings)

    return {
      promptInjectionRisks: uniqueFindings.filter(f => f.category === 'prompt_injection'),
      permissionViolations: uniqueFindings.filter(f => f.category === 'permission_violation'),
      suspiciousBehaviors: uniqueFindings.filter(f =>
        f.category === 'suspicious_behavior' || f.category === 'data_exfiltration'
      ),
      declaredPermissions: response.data.declaredPermissions || [],
      actualPermissions: response.data.actualPermissions || extractActualPermissions(files),
      score: response.data.score || calculateSafetyScore(uniqueFindings),
      summary: response.data.summary || 'Agent safety analysis complete.',
      tokensUsed: response.response.tokensUsed.total
    }

  } catch (error) {
    console.error('Agent safety AI analysis failed:', error)

    // Fall back to quick scan results
    return {
      promptInjectionRisks: quickFindings.filter(f => f.category === 'prompt_injection'),
      permissionViolations: quickFindings.filter(f => f.category === 'permission_violation'),
      suspiciousBehaviors: quickFindings.filter(f => f.category === 'suspicious_behavior'),
      declaredPermissions: [],
      actualPermissions: extractActualPermissions(files),
      score: calculateSafetyScore(quickFindings),
      summary: 'Agent safety analysis completed with pattern matching only (AI analysis failed).',
      tokensUsed: 0
    }
  }
}

/**
 * Extract actual permissions used by the code
 */
function extractActualPermissions(files: ExtractedFile[]): string[] {
  const permissions = new Set<string>()

  for (const file of files) {
    // File system access
    if (/fs\.|readFile|writeFile|readdir/i.test(file.content)) {
      permissions.add('filesystem')
    }

    // Network access
    if (/fetch|axios|http\.|https\.|request\(/i.test(file.content)) {
      permissions.add('network')
    }

    // Process execution
    if (/child_process|spawn|exec\(|execSync/i.test(file.content)) {
      permissions.add('subprocess')
    }

    // Database access
    if (/prisma|mongoose|sequelize|typeorm|knex|pg\.|mysql|sqlite/i.test(file.content)) {
      permissions.add('database')
    }

    // Environment variables
    if (/process\.env/i.test(file.content)) {
      permissions.add('environment')
    }

    // LLM/AI APIs
    if (/openai|anthropic|langchain|cohere|huggingface/i.test(file.content)) {
      permissions.add('llm_api')
    }
  }

  return Array.from(permissions)
}

/**
 * Calculate safety score based on findings
 */
function calculateSafetyScore(findings: AIFinding[]): number {
  if (findings.length === 0) return 100

  let score = 100

  for (const finding of findings) {
    switch (finding.severity) {
      case 'critical':
        score -= 40
        break
      case 'high':
        score -= 20
        break
      case 'medium':
        score -= 10
        break
      case 'low':
        score -= 5
        break
    }
  }

  return Math.max(0, score)
}

/**
 * Find line number for a match
 */
function findLineNumber(content: string, match: string): number {
  const index = content.indexOf(match)
  if (index === -1) return 1
  return content.substring(0, index).split('\n').length
}

/**
 * Truncate string to max length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}

/**
 * Deduplicate findings by file and title
 */
function deduplicateFindings(findings: AIFinding[]): AIFinding[] {
  const seen = new Set<string>()
  return findings.filter(f => {
    const key = `${f.filePath}:${f.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
