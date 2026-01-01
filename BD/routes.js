module.exports = {

  /**
   * * ===============================================
   * SERVICES
   * * ===============================================
   */
  'POST /api/v1/admin/solution/create-service': {
    policy: ['is-admin'],
    action: 'solution/admin/service/create-service',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/solution/list-service': {
    policy: ['is-admin'],
    action: 'solution/admin/service/get-all-service',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/solution/get-service/:serviceId': {
    policy: ['is-admin'],
    action: 'solution/admin/service/get-one-service',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/solution/update-service/:serviceId': {
    policy: ['is-admin'],
    action: 'solution/admin/service/update-service',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/delete-service/:serviceId': {
    policy: ['is-admin'],
    action: 'solution/admin/service/delete-service',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PATCH /api/v1/admin/solution/toggle-service-status/:serviceId': {
    policy: ['is-admin'],
    action: 'solution/admin/service/toggle-service-status',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'GET /api/v1/admin/solution/get-service-stats': {
    policy: ['is-admin'],
    action: 'solution/admin/service/get-services-stats',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PATCH /api/v1/admin/solution/toggle-service-access/:serviceId': {
    policy: ['is-admin'],
    action: 'solution/admin/service/toggle-access',
    swagger: {
      tags: ['SOLUTION (SERVICE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
