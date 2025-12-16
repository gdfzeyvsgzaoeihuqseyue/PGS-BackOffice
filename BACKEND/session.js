module.exports = {

  /**
   * * ===============================================
   * ADMIN SESSIONS
   * * ===============================================
   */
  'GET /api/v1/admin/sessions': {
    action: 'admin/sessions/get-sessions',
    swagger: {
      tags: ['ADMIN (SESSION) - ADMIN'],
      'x-groups': ['admin_access']
    }
  },
  'POST /api/v1/admin/sessions/:sessionId/revoke': {
    action: 'admin/sessions/revoke-session',
    swagger: {
      tags: ['ADMIN (SESSION) - ADMIN'],
      'x-groups': ['admin_access']
    }
  },
  'POST /api/v1/admin/sessions/revoke-all': {
    action: 'admin/sessions/revoke-all-sessions',
    swagger: {
      tags: ['ADMIN (SESSION) - ADMIN'],
      'x-groups': ['admin_access']
    }
  }
};
