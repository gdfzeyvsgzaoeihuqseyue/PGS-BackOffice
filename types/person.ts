export interface User {
  id: string
  fullName: string
  username: string
  email: string
  isActive: boolean
  createdAt: string | number
  updatedAt: string | number
}

export interface Learner extends User {
  id: string
  fullName: string
  username: string
  email: string
  isActive: boolean
  createdAt: string | number
  updatedAt: string | number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}
