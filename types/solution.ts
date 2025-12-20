export interface SolutionPlatform {
  id: string
  slug: string
  name: string
  logo?: string
  logoDesk?: string
  category?: string
  description?: string
  content?: string
  disabled?: boolean
  allowAuth?: boolean
  authType?: 'all' | 'user' | 'learner'
  ctaText?: string
  ctaLink?: string
  features?: string | any[] // Can be JSON string or array
  createdAt?: string
  updatedAt?: string
}

export interface SolutionDoc {
  id: string
  name: string
  link: string
  platform: SolutionPlatform | string // Object on populate, ID otherwise
  createdAt?: string
  updatedAt?: string
}
