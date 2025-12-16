module.exports = {

  /**
   * * ===============================================
   * AUTHENTIFICATION
   * * ===============================================
   */
  'POST /api/v1/admin/auth/register': {
    action: 'admin/auth/register',
    swagger: {
      tags: ['ADMIN (AUTH) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'POST /api/v1/admin/auth/login': {
    action: 'admin/auth/login',
  },
  'GET /api/v1/admin/auth/session': {
    action: 'admin/auth/get-session',
    swagger: {
      tags: ['ADMIN (AUTH) - ADMIN'],
      'x-groups': ['admin_access']
    }
  },
  'POST /api/v1/admin/auth/verify-token': {
    action: 'admin/auth/verify-token',
    swagger: {
      tags: ['ADMIN (AUTH) - ADMIN'],
      'x-groups': ['admin_access']
    }
  },
  'POST /api/v1/admin/auth/refresh-token': {
    action: 'admin/auth/refresh-token',
    swagger: {
      tags: ['ADMIN (AUTH) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'POST /api/v1/admin/auth/logout': {
    policy: ['is-admin'],
    action: 'admin/auth/logout',
  },
};
