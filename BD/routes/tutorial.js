module.exports = {

  /**
   * * ===============================================
   * ADMIN
   * * ===============================================
   */
  'POST /api/v1/admin/solution/tutorial': {
    action: 'solution/admin/tutorial/add-tutorial',
    swagger: {
      tags: ['SOLUTION (TUTORIAL) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/solution/tutorial/:id': {
    action: 'solution/admin/tutorial/update-tutorial',
    swagger: {
      tags: ['SOLUTION (TUTORIAL) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/tutorial/:id': {
    action: 'solution/admin/tutorial/delete-tutorial',
    swagger: {
      tags: ['SOLUTION (TUTORIAL) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
  * * ===============================================
  * PUBLIC
  * * ===============================================
  */
  'GET /api/v1/public/solution/tutorial': {
    action: 'solution/public/tutorial/get-all-tutorial',
    swagger: {
      tags: ['SOLUTION (TUTORIAL) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/tutorial/:id': {
    action: 'solution/public/tutorial/get-one-tutorial',
    swagger: {
      tags: ['SOLUTION (TUTORIAL) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
