/**
 * Sandbox Runner
 * Executes uploaded apps in isolated Docker containers for behavioral analysis
 */

import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { promises as fs } from 'fs'
import path from 'path'
import { SandboxResult, AIFinding, DEFAULT_AI_REVIEW_CONFIG } from './types'

const execAsync = promisify(exec)

// Docker image name
const SANDBOX_IMAGE = 'moltstore-sandbox:latest'

/**
 * Check if Docker is available
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    await execAsync('docker version')
    return true
  } catch {
    return false
  }
}

/**
 * Check if sandbox is enabled
 */
export function isSandboxEnabled(): boolean {
  return process.env.DOCKER_SANDBOX_ENABLED === 'true'
}

/**
 * Build sandbox Docker image
 */
export async function buildSandboxImage(): Promise<void> {
  const dockerPath = path.join(process.cwd(), 'docker', 'sandbox')

  try {
    console.log('Building sandbox Docker image...')
    await execAsync(`docker build -t ${SANDBOX_IMAGE} ${dockerPath}`)
    console.log('Sandbox image built successfully')
  } catch (error) {
    console.error('Failed to build sandbox image:', error)
    throw new Error('Failed to build sandbox Docker image')
  }
}

/**
 * Ensure sandbox image exists
 */
async function ensureSandboxImage(): Promise<void> {
  try {
    await execAsync(`docker image inspect ${SANDBOX_IMAGE}`)
  } catch {
    // Image doesn't exist, build it
    await buildSandboxImage()
  }
}

/**
 * Run app in sandbox container
 */
export async function runInSandbox(
  codePath: string,
  options: {
    timeout?: number
    memoryLimit?: string
    cpuLimit?: number
  } = {}
): Promise<SandboxResult> {
  const startTime = Date.now()

  // Check if sandbox is enabled
  if (!isSandboxEnabled()) {
    return {
      passed: true,
      networkRequests: [],
      fileAccess: [],
      processSpawned: [],
      resourceUsage: { cpuPercent: 0, memoryMb: 0, diskMb: 0 },
      findings: [],
      score: 100,
      executionTimeMs: 0
    }
  }

  // Check Docker availability
  if (!(await isDockerAvailable())) {
    console.warn('Docker not available, skipping sandbox analysis')
    return {
      passed: true,
      networkRequests: [],
      fileAccess: [],
      processSpawned: [],
      resourceUsage: { cpuPercent: 0, memoryMb: 0, diskMb: 0 },
      findings: [{
        severity: 'info',
        category: 'suspicious_behavior',
        title: 'Sandbox skipped',
        description: 'Docker is not available for sandbox testing',
        confidence: 1.0
      }],
      score: 100,
      executionTimeMs: 0
    }
  }

  // Ensure sandbox image exists
  await ensureSandboxImage()

  // Get configuration
  const config = DEFAULT_AI_REVIEW_CONFIG
  const timeout = options.timeout || parseInt(process.env.SANDBOX_TIMEOUT_SECONDS || String(config.sandboxTimeoutSeconds))
  const memoryLimit = options.memoryLimit || process.env.SANDBOX_MEMORY_LIMIT || config.sandboxMemoryLimit
  const cpuLimit = options.cpuLimit || parseFloat(process.env.SANDBOX_CPU_LIMIT || String(config.sandboxCpuLimit))

  // Create temporary output directory
  const tmpDir = path.join(process.env.TMPDIR || '/tmp', `moltstore-sandbox-${Date.now()}`)
  await fs.mkdir(tmpDir, { recursive: true })
  const outputDir = path.join(tmpDir, 'output')
  const logsDir = path.join(tmpDir, 'logs')
  await fs.mkdir(outputDir, { recursive: true })
  await fs.mkdir(logsDir, { recursive: true })

  try {
    // Run container with restrictions
    const containerName = `moltstore-sandbox-${Date.now()}`

    const dockerArgs = [
      'run',
      '--rm',
      `--name=${containerName}`,
      `--memory=${memoryLimit}`,
      `--cpus=${cpuLimit}`,
      '--network=none', // No network access
      '--read-only', // Read-only root filesystem
      '--tmpfs=/tmp:rw,noexec,nosuid,size=100m', // Writable /tmp
      `--env=SANDBOX_TIMEOUT=${timeout}`,
      `-v=${codePath}:/app/code:ro`, // Mount code as read-only
      `-v=${outputDir}:/app/output:rw`, // Mount output as writable
      `-v=${logsDir}:/app/logs:rw`, // Mount logs as writable
      '--cap-drop=ALL', // Drop all capabilities
      '--security-opt=no-new-privileges', // Prevent privilege escalation
      SANDBOX_IMAGE
    ]

    console.log(`Running sandbox with timeout=${timeout}s, memory=${memoryLimit}, cpu=${cpuLimit}`)

    // Run container
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('docker', dockerArgs, {
        timeout: (timeout + 10) * 1000 // Add buffer to timeout
      })

      let stdout = ''
      let stderr = ''

      proc.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        if (code === 0 || code === 124) {
          resolve()
        } else {
          reject(new Error(`Container exited with code ${code}: ${stderr}`))
        }
      })

      proc.on('error', reject)

      // Kill container if it runs too long
      setTimeout(() => {
        execAsync(`docker kill ${containerName}`).catch(() => {})
      }, (timeout + 5) * 1000)
    })

    // Read metrics
    const metricsPath = path.join(outputDir, 'metrics.json')
    let metrics: any = {}
    try {
      const metricsContent = await fs.readFile(metricsPath, 'utf-8')
      metrics = JSON.parse(metricsContent)
    } catch {
      // Metrics file may not exist if container was killed
    }

    // Read logs
    const logPath = path.join(logsDir, 'execution.log')
    let logs = ''
    try {
      logs = await fs.readFile(logPath, 'utf-8')
    } catch {
      // Logs may not exist
    }

    // Analyze results
    const findings: AIFinding[] = []

    // Check for suspicious patterns in logs
    if (logs.includes('ECONNREFUSED') || logs.includes('network')) {
      findings.push({
        severity: 'medium',
        category: 'suspicious_behavior',
        title: 'Network access attempt',
        description: 'App attempted to make network requests while isolated',
        confidence: 0.8
      })
    }

    if (logs.includes('EACCES') || logs.includes('permission denied')) {
      findings.push({
        severity: 'low',
        category: 'permission_violation',
        title: 'Permission denied',
        description: 'App attempted to access restricted resources',
        confidence: 0.7
      })
    }

    if (metrics.status === 'timeout') {
      findings.push({
        severity: 'medium',
        category: 'suspicious_behavior',
        title: 'Execution timeout',
        description: `App did not complete within ${timeout} seconds`,
        confidence: 0.9
      })
    }

    if (metrics.status === 'error') {
      findings.push({
        severity: 'low',
        category: 'code_quality',
        title: 'Runtime error',
        description: 'App encountered an error during execution',
        confidence: 0.8
      })
    }

    // Calculate score
    let score = 100
    for (const finding of findings) {
      if (finding.severity === 'critical') score -= 40
      else if (finding.severity === 'high') score -= 25
      else if (finding.severity === 'medium') score -= 15
      else if (finding.severity === 'low') score -= 5
    }
    score = Math.max(0, score)

    const executionTimeMs = Date.now() - startTime

    return {
      passed: findings.every(f => f.severity !== 'critical' && f.severity !== 'high'),
      networkRequests: [], // Network is disabled
      fileAccess: [],
      processSpawned: [],
      resourceUsage: {
        cpuPercent: 0,
        memoryMb: 0,
        diskMb: 0
      },
      findings,
      score,
      executionTimeMs
    }

  } finally {
    // Cleanup
    try {
      await fs.rm(tmpDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Quick sandbox check (no actual execution)
 */
export function quickSandboxCheck(hasNetworkCode: boolean, hasFileSystemCode: boolean): SandboxResult {
  const findings: AIFinding[] = []

  if (hasNetworkCode) {
    findings.push({
      severity: 'info',
      category: 'permission_violation',
      title: 'Network capability detected',
      description: 'App appears to use network features. Consider sandbox testing.',
      confidence: 0.6
    })
  }

  if (hasFileSystemCode) {
    findings.push({
      severity: 'info',
      category: 'permission_violation',
      title: 'File system capability detected',
      description: 'App appears to access the file system. Consider sandbox testing.',
      confidence: 0.6
    })
  }

  return {
    passed: true,
    networkRequests: [],
    fileAccess: [],
    processSpawned: [],
    resourceUsage: { cpuPercent: 0, memoryMb: 0, diskMb: 0 },
    findings,
    score: 100,
    executionTimeMs: 0
  }
}
