module.exports = {

  /**
   * * ===============================================
   * INVITATION
   * * ===============================================
   */
  'POST /api/v1/admin/invite/invite-admin': {
    policy: ['is-admin'],
    allowedRoles: ['main'],
    action: 'admin/invite/invite-admin',
    swagger: {
      tags: ['ADMIN (INVITE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'POST /api/v1/admin/invite/resend': {
    policy: ['is-admin'],
    allowedRoles: ['main'],
    action: 'admin/invite/resend-invite',
    swagger: {
      tags: ['ADMIN (INVITE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'POST /api/v1/admin/invite/accept-invitation': {
    action: 'admin/invite/accept-invitation',
    swagger: {
      tags: ['ADMIN (INVITE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
