import type { SolutionFaqTopic } from './faq-topic'

export interface SolutionFaq {
  id: string
  question: string
  answer: string
  topic: SolutionFaqTopic | string
  status: 'active' | 'inactive'
  isUseful: number
  isUseless: number
  createdAt?: string
  updatedAt?: string
}
