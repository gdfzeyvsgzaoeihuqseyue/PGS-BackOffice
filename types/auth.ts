import type { Admin } from './person'

export interface AuthResponse {
  message?: string
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  admin?: Admin
}

export interface LoginCredentials {
  email: string
  password: string
}
