module.exports = {

  /**
   * * ===============================================
   * ADMIN
   * * ===============================================
   */
  'POST /api/v1/solution/doc': {
    action: 'solution/admin/doc/add-doc',
    swagger: {
      tags: ['SOLUTION (DOC) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/solution/doc/:id': {
    action: 'solution/admin/doc/update-doc',
    swagger: {
      tags: ['SOLUTION (DOC) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/solution/doc/:id': {
    action: 'solution/admin/doc/delete-doc',
    swagger: {
      tags: ['SOLUTION (DOC) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
   * * ===============================================
   * PUBLIC
   * * ===============================================
   */
  'GET /api/v1/solution/doc': {
    action: 'solution/public/doc/get-all-doc',
    swagger: {
      tags: ['SOLUTION (DOC) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/solution/doc/:id': {
    action: 'solution/public/doc/get-one-doc',
    swagger: {
      tags: ['SOLUTION (DOC) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
