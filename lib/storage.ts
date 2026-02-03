// File storage adapter - Vercel Blob for production, local for dev
import { put } from '@vercel/blob'
import fs from 'fs/promises'
import path from 'path'

const isProduction = process.env.VERCEL === '1'

export const uploadFile = async (
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; pathname: string }> => {
  if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
    // Use Vercel Blob in production
    const blob = await put(filename, file, {
      access: 'public',
      contentType,
    })
    
    return {
      url: blob.url,
      pathname: blob.pathname,
    }
  } else {
    // Use local filesystem in development
    const uploadDir = path.join(process.cwd(), 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    
    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, file)
    
    return {
      url: `/uploads/${filename}`,
      pathname: filePath,
    }
  }
}

export const getFileUrl = (pathname: string): string => {
  if (isProduction) {
    return pathname // Already a full URL in production
  } else {
    // Local path
    return pathname
  }
}
