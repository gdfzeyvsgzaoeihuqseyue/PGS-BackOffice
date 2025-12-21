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
  features?: string | any[]
  createdAt?: string
  updatedAt?: string
}

export interface SolutionDoc {
  id: string
  name: string
  link: string
  platform: SolutionPlatform | string
  createdAt?: string
  updatedAt?: string
}

export interface SolutionPartner {
  id: string
  name: string
  website?: string
  logo?: string
  platform: SolutionPlatform | string
  createdAt?: string
  updatedAt?: string
}

export interface SolutionTestimony {
  id: string
  author: string
  company?: string
  role?: string
  content: string
  note?: number
  avatar?: string
  isPublished: boolean
  isFeatured: boolean
  platform: SolutionPlatform | string
  createdAt?: string
  updatedAt?: string
}

export interface SolutionWiki {
  id: string
  slug: string
  name: string
  description: string
  url: string
  additionalInfo?: string
  platform: SolutionPlatform | string
  createdAt?: string
  updatedAt?: string
}

export interface SolutionTuto {
  id: string
  title: string
  description?: string
  time?: string
  link: string
  platform: SolutionPlatform | string
  createdAt?: string
  updatedAt?: string
}


export interface SolutionFaqTopic {
  id: string
  name: string
  order?: number
  platform?: SolutionPlatform | string
  createdAt?: string
  updatedAt?: string
}

export interface SolutionFaq {
  id: string
  question: string
  answer: string
  topic?: SolutionFaqTopic | string
  platform?: SolutionPlatform | string
  isPublished?: boolean
  votes?: number
  createdAt?: string
  updatedAt?: string
}

export interface Service {
  id: string
  name: string
  domain: string
  description?: string
  isActive: boolean
  allowedOrigins: string[] | string
  apiKey?: string
  stats?: {
    users: { active: number, inactive: number, total: number }
    learners: { active: number, inactive: number, total: number }
    totalAccess: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface ServiceStats {
  overview: {
    services: { total: number; active: number; inactive: number }
    access: {
      users: { total: number; active: number; inactive: number }
      learners: { total: number; active: number; inactive: number }
      combined: { total: number; active: number; inactive: number }
    }
    averages: { accessPerService: number }
  }
  topServices: {
    title: string
    data: any[]
  }
  leastUsedServices: {
    title: string
    data: any[]
  }
  unusedServices: {
    title: string
    count: number
    data: any[]
  }
  healthIndicators: {
    servicesUtilization: number
    accessRate: number
    unusedServicesPercentage: number
  }
}
