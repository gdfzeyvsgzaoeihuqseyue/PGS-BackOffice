module.exports = {

  /**
   * * ===============================================
   * ADMIN
   * * ===============================================
   */
  'POST /api/v1/admin/solution/platform': {
    action: 'solution/admin/platform/add-platform',
    swagger: {
      tags: ['SOLUTION (PLATFORM) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/solution/platform/:id': {
    action: 'solution/admin/platform/update-platform',
    swagger: {
      tags: ['SOLUTION (PLATFORM) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/platform/:id': {
    action: 'solution/admin/platform/delete-platform',
    swagger: {
      tags: ['SOLUTION (PLATFORM) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
   * * ===============================================
   * PUBLIC
   * * ===============================================
   */
  'GET /api/v1/public/solution/platform': {
    action: 'solution/public/platform/get-all-platform',
    swagger: {
      tags: ['SOLUTION (PLATFORM) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/platform/:identifier': {
    action: 'solution/public/platform/get-one-platform',
    swagger: {
      tags: ['SOLUTION (PLATFORM) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
