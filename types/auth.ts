export interface SuperAdmin {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  role: string
  permissions: {
    canManageAll: boolean
    [key: string]: any
  }
  emailVerified: boolean
  isActive: boolean
  lastLogin: string
  createdAt: number
  twoFactorEnabled: boolean
}

export interface AuthResponse {
  message?: string
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  superAdmin?: SuperAdmin
}

export interface LoginCredentials {
  email: string
  password: string
}
