module.exports = {

  /**
   * * ===============================================
   * ADMIN
   * * ===============================================
   */
  'POST /api/v1/admin/solution/testimony': {
    action: 'solution/admin/testimony/add-testimony',
    swagger: {
      tags: ['SOLUTION (TESTIMONY) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'PUT /api/v1/admin/solution/testimony/:id': {
    action: 'solution/admin/testimony/update-testimony',
    swagger: {
      tags: ['SOLUTION (TESTIMONY) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/testimony/:id': {
    action: 'solution/admin/testimony/delete-testimony',
    swagger: {
      tags: ['SOLUTION (TESTIMONY) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
  * * ===============================================
  * PUBLIC
  * * ===============================================
  */
  'GET /api/v1/public/solution/testimony': {
    action: 'solution/public/testimony/get-all-testimony',
    swagger: {
      tags: ['SOLUTION (TESTIMONY) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/testimony/:id': {
    action: 'solution/public/testimony/get-one-testimony',
    swagger: {
      tags: ['SOLUTION (TESTIMONY) - PUBLIC'],
      'x-groups': ['full_access']
    }
  },
};
