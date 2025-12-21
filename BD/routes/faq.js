module.exports = {

  /**
   * * ===============================================
   * AMDIN
   * * ===============================================
   */
  'POST /api/v1/admin/solution/faq': {
    action: 'solution/admin/faq/add-faq',
    swagger: {
      tags: ['SOLUTION (FAQ) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/solution/faq/:id': {
    action: 'solution/admin/faq/update-faq',
    swagger: {
      tags: ['SOLUTION (FAQ) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/faq/:id': {
    action: 'solution/admin/faq/delete-faq',
    swagger: {
      tags: ['SOLUTION (FAQ) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PATCH /api/v1/admin/solution/reset-vote/:id': {
    action: 'solution/admin/faq/reset-votes',
    swagger: {
      tags: ['SOLUTION (FAQ) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
   * * ===============================================
   * PUBLIC
   * * ===============================================
   */
  'GET /api/v1/public/solution/faq': {
    action: 'solution/public/faq/get-all-faq',
    swagger: {
      tags: ['SOLUTION (FAQ) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/faq/:id': {
    action: 'solution/public/faq/get-one-faq',
    swagger: {
      tags: ['SOLUTION (FAQ) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'PATCH /api/v1/public/solution/vote-useful/:id': {
    action: 'solution/public/faq/vote-useful',
    swagger: {
      tags: ['SOLUTION (FAQ) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'PATCH /api/v1/public/solution/vote-useless/:id': {
    action: 'solution/public/faq/vote-useless',
    swagger: {
      tags: ['SOLUTION (FAQ) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
