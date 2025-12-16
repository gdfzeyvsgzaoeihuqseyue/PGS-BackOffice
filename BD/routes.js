module.exports = {

  /**
   * * ===============================================
   * LOGS DES ACTIVITES
   * * ===============================================
   */
  'GET /api/v1/admin/activity-logs': {
    policy: ['is-admin'],
    action: 'admin/other/get-activity-logs',
    swagger: {
      tags: ['ADMIN (LOG) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/all-activity-logs': {
    policy: ['is-admin'],
    action: 'admin/other/get-all-activity-logs',
    swagger: {
      tags: ['ADMIN (LOG) - ADMIN'],
      'x-groups': ['full_access']
    }
  },

  'GET /api/v1/admin/admins': {
    policy: ['is-admin'],
    action: 'admin/invite/get-admins',
    swagger: {
      tags: ['ADMIN (INVITE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'POST /api/v1/admin/invite/resend': {
    policy: ['is-admin'],
    action: 'admin/invite/resend-invite',
    swagger: {
      tags: ['ADMIN (INVITE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
