module.exports = {

  /**
   * * ===============================================
   * LOGS DES ACTIVITES
   * * ===============================================
   */
  'GET /api/v1/admin/get-my-all-logs': {
    policy: ['is-admin'],
    action: 'admin/logs/get-my-all-logs',
    swagger: {
      tags: ['ADMIN (LOGS) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/get-my-one-log/:id': {
    policy: ['is-admin'],
    action: 'admin/logs/get-my-one-log',
    swagger: {
      tags: ['ADMIN (LOGS) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/get-syst-all-logs': {
    policy: ['is-admin'],
    allowedRoles: ['main', 'admin', 'analyst',],
    action: 'admin/logs/get-syst-all-logs',
    swagger: {
      tags: ['ADMIN (LOGS) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/get-syst-one-logs/:id': {
    policy: ['is-admin'],
    allowedRoles: ['main', 'admin', 'analyst',],
    action: 'admin/logs/get-syst-one-logs',
    swagger: {
      tags: ['ADMIN (LOGS) - ADMIN'],
      'x-groups': ['full_access']
    }
  },



  'GET /api/v1/admin/get-all-admins': {
    policy: ['is-admin'],
    allowedRoles: ['main', 'admin'],
    action: 'admin/manage/get-all-admins',
    swagger: {
      tags: ['ADMIN (MANAGE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/manage/get-admin/:id': {
    policy: ['is-admin'],
    allowedRoles: ['main', 'admin'],
    action: 'admin/manage/get-one-admin',
    swagger: {
      tags: ['ADMIN (MANAGE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
