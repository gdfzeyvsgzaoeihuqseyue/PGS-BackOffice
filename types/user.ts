export interface User {
  id: string
  fullName: string
  username: string
  email: string
  isActive: boolean
  createdAt: string | number
  // Add other specific fields
}

export interface Learner extends User {
  // specific learner fields if any
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
