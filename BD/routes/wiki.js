module.exports = {

  /**
   * * ===============================================
   * ADMIN
   * * ===============================================
   */
  'POST /api/v1/admin/solution/wiki': {
    action: 'solution/admin/wiki/add-wiki',
    swagger: {
      tags: ['SOLUTION (WIKI) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/solution/wiki/:id': {
    action: 'solution/admin/wiki/update-wiki',
    swagger: {
      tags: ['SOLUTION (WIKI) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/wiki/:id': {
    action: 'solution/admin/wiki/delete-wiki',
    swagger: {
      tags: ['SOLUTION (WIKI) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
   * * ===============================================
   * PUBLIC
   * * ===============================================
   */
  'GET /api/v1/public/solution/wiki': {
    action: 'solution/public/wiki/get-all-wiki',
    swagger: {
      tags: ['SOLUTION (WIKI) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/wiki/:identifier': {
    action: 'solution/public/wiki/get-one-wiki',
    swagger: {
      tags: ['SOLUTION (WIKI) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/wiki/counts': {
    action: 'solution/public/wiki/count-wikis',
    swagger: {
      tags: ['SOLUTION (WIKI) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
