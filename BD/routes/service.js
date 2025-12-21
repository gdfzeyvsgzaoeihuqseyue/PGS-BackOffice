module.exports = {

  /**
   * * ===============================================
   * SERVICES
   * * ===============================================
   */
  'POST /api/v1/admin/service/create': {
    // policy: ['is-admin'], PEUT-ÊTRE CECI OU
    policy: ['service-auth'],
    action: 'service/create-service',
    swagger: {
      tags: ['SERVICE - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/service/list': {
    policy: ['is-admin'],
    action: 'service/get-all-service',
    swagger: {
      tags: ['SERVICE - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/service/:serviceId': {
    policy: ['is-admin'],
    action: 'service/get-one-service',
    swagger: {
      tags: ['SERVICE - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/service/:serviceId': {
    policy: ['is-admin'],
    action: 'service/update-service',
    swagger: {
      tags: ['SERVICE - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/service/:serviceId': {
    policy: ['is-admin'],
    action: 'service/delete-service',
    swagger: {
      tags: ['SERVICE - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PATCH /api/v1/admin/service/:serviceId/toggle': {
    policy: ['is-admin'],
    action: 'service/toggle-service-status',
    swagger: {
      tags: ['SERVICE - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/service/stats': {
    policy: ['is-admin'],
    action: 'service/get-services-stats',
    swagger: {
      tags: ['SERVICE - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
