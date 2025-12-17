export interface Session {
  id: string
  adminId: string
  token: string
  refreshToken: string
  expiresAt: string
  refreshExpiresAt: string
  ipAddress: string
  userAgent: string
  isRevoked: boolean
  deviceInfo: any
  createdAt: string
  updatedAt: string
}