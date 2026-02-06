/**
 * File Extractor
 * Extracts and parses uploaded archives for code analysis
 */

import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import * as tar from 'tar'
import { ExtractedFile, DEFAULT_AI_REVIEW_CONFIG } from './types'

/**
 * Calculate SHA-256 hash of content
 */
export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Check if file extension is a code file
 */
export function isCodeFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  const config = DEFAULT_AI_REVIEW_CONFIG

  // Check excluded extensions
  if (config.excludedExtensions.some(e => filePath.toLowerCase().endsWith(e))) {
    return false
  }

  // Check included extensions
  return config.includedExtensions.some(e => ext === e || filePath.endsWith(e))
}

/**
 * Check if file should be skipped (binary, too large, etc.)
 */
export function shouldSkipFile(filePath: string, size: number): boolean {
  const config = DEFAULT_AI_REVIEW_CONFIG

  // Skip large files
  if (size > config.maxFileSizeKb * 1024) {
    return true
  }

  // Skip hidden files and directories
  const parts = filePath.split(path.sep)
  if (parts.some(p => p.startsWith('.') && p !== '.env.example' && p !== '.env.sample')) {
    return true
  }

  // Skip node_modules, vendor directories
  if (parts.some(p => ['node_modules', 'vendor', '__pycache__', '.git', 'dist', 'build', 'coverage'].includes(p))) {
    return true
  }

  return false
}

/**
 * Extract ZIP archive to temp directory
 */
async function extractZip(archivePath: string, extractDir: string): Promise<void> {
  const zip = new AdmZip(archivePath)
  zip.extractAllTo(extractDir, true)
}

/**
 * Extract TAR.GZ archive to temp directory
 */
async function extractTarGz(archivePath: string, extractDir: string): Promise<void> {
  await tar.extract({
    file: archivePath,
    cwd: extractDir
  })
}

/**
 * Read all files recursively from directory
 */
async function readFilesRecursive(
  dir: string,
  baseDir: string,
  files: ExtractedFile[] = []
): Promise<ExtractedFile[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.relative(baseDir, fullPath)

    if (entry.isDirectory()) {
      // Skip certain directories
      if (!shouldSkipFile(relativePath, 0)) {
        await readFilesRecursive(fullPath, baseDir, files)
      }
    } else if (entry.isFile()) {
      const stats = await fs.stat(fullPath)

      if (shouldSkipFile(relativePath, stats.size)) {
        continue
      }

      if (!isCodeFile(relativePath)) {
        continue
      }

      try {
        const content = await fs.readFile(fullPath, 'utf-8')
        const hash = hashContent(content)
        const ext = path.extname(relativePath).toLowerCase()

        files.push({
          path: fullPath,
          relativePath,
          content,
          hash,
          size: stats.size,
          extension: ext,
          isCodeFile: true
        })
      } catch (error) {
        // Skip binary files that can't be read as UTF-8
        console.warn(`Skipping non-text file: ${relativePath}`)
      }
    }
  }

  return files
}

/**
 * Create temporary directory for extraction
 */
async function createTempDir(prefix: string): Promise<string> {
  const tmpBase = process.env.TMPDIR || '/tmp'
  const tmpDir = path.join(tmpBase, `moltstore-ai-review-${prefix}-${Date.now()}`)
  await fs.mkdir(tmpDir, { recursive: true })
  return tmpDir
}

/**
 * Clean up temporary directory
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true })
  } catch (error) {
    console.warn(`Failed to cleanup temp directory: ${dir}`, error)
  }
}

/**
 * Extract archive and return code files
 */
export async function extractArchive(archivePath: string): Promise<{
  files: ExtractedFile[]
  extractDir: string
  totalSize: number
}> {
  const ext = path.extname(archivePath).toLowerCase()
  const extractDir = await createTempDir('extract')

  try {
    // Extract based on file type
    if (ext === '.zip') {
      await extractZip(archivePath, extractDir)
    } else if (ext === '.gz' || ext === '.tgz' || archivePath.endsWith('.tar.gz')) {
      await extractTarGz(archivePath, extractDir)
    } else if (ext === '.tar') {
      await extractTarGz(archivePath, extractDir)
    } else {
      throw new Error(`Unsupported archive format: ${ext}`)
    }

    // Read all code files
    const files = await readFilesRecursive(extractDir, extractDir)

    // Calculate total size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)

    // Check total size limit
    const config = DEFAULT_AI_REVIEW_CONFIG
    if (totalSize > config.maxTotalSizeKb * 1024) {
      throw new Error(`Total code size exceeds limit: ${Math.round(totalSize / 1024)}KB > ${config.maxTotalSizeKb}KB`)
    }

    // Check file count limit
    if (files.length > config.maxFilesPerApp) {
      throw new Error(`Too many files: ${files.length} > ${config.maxFilesPerApp}`)
    }

    return { files, extractDir, totalSize }
  } catch (error) {
    // Cleanup on error
    await cleanupTempDir(extractDir)
    throw error
  }
}

/**
 * Group files by type for prioritized analysis
 */
export function groupFilesByPriority(files: ExtractedFile[]): {
  highPriority: ExtractedFile[]
  mediumPriority: ExtractedFile[]
  lowPriority: ExtractedFile[]
} {
  const highPriority: ExtractedFile[] = []
  const mediumPriority: ExtractedFile[] = []
  const lowPriority: ExtractedFile[] = []

  for (const file of files) {
    const relativePath = file.relativePath.toLowerCase()

    // High priority: Entry points, API handlers, auth code
    if (
      relativePath.includes('index.') ||
      relativePath.includes('main.') ||
      relativePath.includes('app.') ||
      relativePath.includes('server.') ||
      relativePath.includes('api/') ||
      relativePath.includes('route') ||
      relativePath.includes('auth') ||
      relativePath.includes('login') ||
      relativePath.includes('security') ||
      relativePath.includes('middleware') ||
      relativePath.endsWith('.env.example')
    ) {
      highPriority.push(file)
    }
    // Medium priority: Core logic files
    else if (
      relativePath.includes('lib/') ||
      relativePath.includes('src/') ||
      relativePath.includes('utils/') ||
      relativePath.includes('helper') ||
      relativePath.includes('service') ||
      relativePath.includes('controller') ||
      relativePath.includes('model')
    ) {
      mediumPriority.push(file)
    }
    // Low priority: Tests, configs, etc.
    else {
      lowPriority.push(file)
    }
  }

  return { highPriority, mediumPriority, lowPriority }
}

/**
 * Get file statistics
 */
export function getFileStats(files: ExtractedFile[]): {
  totalFiles: number
  totalSize: number
  byExtension: Record<string, number>
  avgFileSize: number
} {
  const byExtension: Record<string, number> = {}
  let totalSize = 0

  for (const file of files) {
    totalSize += file.size
    byExtension[file.extension] = (byExtension[file.extension] || 0) + 1
  }

  return {
    totalFiles: files.length,
    totalSize,
    byExtension,
    avgFileSize: files.length > 0 ? Math.round(totalSize / files.length) : 0
  }
}
