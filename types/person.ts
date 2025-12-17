export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  email: string;
  role: 'main' | 'admin' | 'moderator' | 'support' | 'analyst';
  // permissions: Record<string, any>;
  permissions: {
    canManageAll: boolean
    [key: string]: any
  }
  status: 'active' | 'pending' | 'suspended' | 'deleted';
  emailVerified: boolean;
  lastLogin?: string | null;
  createdBy?: string | null;
  twoFactorEnabled: boolean;
  emailProofToken?: string | null;
  emailProofTokenExpiresAt?: number | null;
  createdAt: string;
  updatedAt: string;
}

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
