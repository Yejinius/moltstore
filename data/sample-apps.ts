export type AppStatus = 'pending' | 'in_review' | 'approved' | 'published' | 'rejected'

export interface App {
  id: string
  name: string
  description: string
  longDescription: string
  category: string
  price: number
  currency: string
  verified: boolean
  downloads: number
  rating: number
  developer: {
    name: string
    verified: boolean
  }
  features: string[]
  apiAccess: boolean
  lastUpdated: string
  version: string
  tags: string[]
  status?: AppStatus
  fileHash?: string
  uploadedAt?: string
  reviewNotes?: string
}

export const sampleApps: App[] = [
  {
    id: '1',
    name: 'Smart Email Parser',
    description: 'AI-powered email parsing and categorization API for agents',
    longDescription: 'Advanced email parsing system that uses AI to extract structured data from emails, categorize them, and provide actionable insights. Perfect for AI agents that need to process large volumes of emails.',
    category: 'Productivity',
    price: 29,
    currency: 'USD',
    verified: true,
    downloads: 1250,
    rating: 4.8,
    developer: {
      name: 'DataFlow Labs',
      verified: true
    },
    features: [
      'AI-powered email parsing',
      'Auto-categorization',
      'Structured data extraction',
      'RESTful API',
      'Real-time processing'
    ],
    apiAccess: true,
    lastUpdated: '2026-02-01',
    version: '2.1.0',
    tags: ['email', 'ai', 'parsing', 'productivity']
  },
  {
    id: '2',
    name: 'Task Scheduler Pro',
    description: 'Advanced task scheduling and automation for AI workflows',
    longDescription: 'Professional-grade task scheduler designed specifically for AI agents. Schedule, prioritize, and automate complex workflows with ease.',
    category: 'Automation',
    price: 49,
    currency: 'USD',
    verified: true,
    downloads: 890,
    rating: 4.9,
    developer: {
      name: 'AutoMate Inc',
      verified: true
    },
    features: [
      'Cron-based scheduling',
      'Priority queues',
      'Webhook support',
      'Retry logic',
      'Status monitoring'
    ],
    apiAccess: true,
    lastUpdated: '2026-01-28',
    version: '3.0.2',
    tags: ['scheduler', 'automation', 'workflow', 'cron']
  },
  {
    id: '3',
    name: 'Data Transformer',
    description: 'Transform and validate data between different formats',
    longDescription: 'Universal data transformation tool supporting JSON, XML, CSV, and more. Built-in validation and error handling for reliable data processing.',
    category: 'Data',
    price: 19,
    currency: 'USD',
    verified: true,
    downloads: 2100,
    rating: 4.7,
    developer: {
      name: 'DevTools Co',
      verified: true
    },
    features: [
      'Multi-format support',
      'Schema validation',
      'Batch processing',
      'Error handling',
      'Custom transformations'
    ],
    apiAccess: true,
    lastUpdated: '2026-02-02',
    version: '1.5.1',
    tags: ['data', 'transformer', 'validation', 'json', 'xml']
  },
  {
    id: '4',
    name: 'Webhook Manager',
    description: 'Manage and route webhooks with advanced filtering',
    longDescription: 'Enterprise-grade webhook management system with advanced routing, filtering, and retry capabilities. Perfect for integrating multiple services.',
    category: 'Integration',
    price: 39,
    currency: 'USD',
    verified: true,
    downloads: 650,
    rating: 4.6,
    developer: {
      name: 'IntegrateLabs',
      verified: true
    },
    features: [
      'Smart routing',
      'Payload filtering',
      'Retry mechanism',
      'Logging',
      'Real-time monitoring'
    ],
    apiAccess: true,
    lastUpdated: '2026-01-30',
    version: '2.3.0',
    tags: ['webhook', 'integration', 'routing', 'api']
  },
  {
    id: '5',
    name: 'AI Content Generator',
    description: 'Generate high-quality content using multiple AI models',
    longDescription: 'Multi-model AI content generation platform. Create articles, summaries, translations, and more using the best AI models available.',
    category: 'AI',
    price: 59,
    currency: 'USD',
    verified: true,
    downloads: 1800,
    rating: 4.9,
    developer: {
      name: 'AI Factory',
      verified: true
    },
    features: [
      'Multiple AI models',
      'Content templates',
      'Batch generation',
      'Quality scoring',
      'Custom prompts'
    ],
    apiAccess: true,
    lastUpdated: '2026-02-01',
    version: '4.2.0',
    tags: ['ai', 'content', 'generation', 'nlp', 'gpt']
  },
  {
    id: '6',
    name: 'Security Scanner',
    description: 'Automated security scanning for APIs and services',
    longDescription: 'Comprehensive security scanner that checks for vulnerabilities, misconfigurations, and security best practices. Essential for maintaining secure systems.',
    category: 'Security',
    price: 99,
    currency: 'USD',
    verified: true,
    downloads: 420,
    rating: 5.0,
    developer: {
      name: 'SecureOps',
      verified: true
    },
    features: [
      'Vulnerability scanning',
      'API security testing',
      'Compliance checks',
      'Detailed reports',
      'Automated fixes'
    ],
    apiAccess: true,
    lastUpdated: '2026-02-02',
    version: '5.1.0',
    tags: ['security', 'scanner', 'vulnerability', 'api', 'compliance']
  }
]

export const categories = [
  'All',
  'Productivity',
  'Automation',
  'Data',
  'Integration',
  'AI',
  'Security'
]
