export interface ActivityLog {
  id: string;
  admin?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null;
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  createdAt: string;
}

export interface ActivityFilter {
  page?: number;
  limit?: number;
  targetType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  adminId?: string;
}
