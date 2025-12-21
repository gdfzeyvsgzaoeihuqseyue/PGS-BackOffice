import type { SolutionPlatform } from './solution'

export interface SolutionFaqTopic {
  id: string
  name: string
  slug?: string
  description?: string
  platform: SolutionPlatform | string
  status: 'active' | 'inactive'
  faqs?: any[] // Collection
  createdAt?: string
  updatedAt?: string
}
