module.exports = {

  /**
   * * ===============================================
   * ADMIN
   * * ===============================================
   */
  'POST /api/v1/admin/solution/partner': {
    action: 'solution/admin/partners/add-partner',
    swagger: {
      tags: ['SOLUTION (PARTNER) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/solution/partner/:id': {
    action: 'solution/admin/partners/update-partner',
    swagger: {
      tags: ['SOLUTION (PARTNER) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/partner/:id': {
    action: 'solution/admin/partners/delete-partner',
    swagger: {
      tags: ['SOLUTION (PARTNER) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
   * * ===============================================
   * PUBLIC
   * * ===============================================
   */
  'GET /api/v1/public/solution/partner': {
    action: 'solution/public/partners/get-all-partner',
    swagger: {
      tags: ['SOLUTION (PARTNER) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/partner/:id': {
    action: 'solution/public/partners/get-one-partner',
    swagger: {
      tags: ['SOLUTION (PARTNER) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
