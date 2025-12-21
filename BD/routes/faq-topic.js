module.exports = {

  /**
   * * ===============================================
   * AMDIN
   * * ===============================================
   */
  'POST /api/v1/admin/solution/faq-topic': {
    action: 'solution/admin/faq-topic/add-faq-topic',
    swagger: {
      tags: ['SOLUTION (FAQ TOPIC) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/solution/faq-topic/:id': {
    action: 'solution/admin/faq-topic/update-faq-topic',
    swagger: {
      tags: ['SOLUTION (FAQ TOPIC) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/solution/faq-topic/:id': {
    action: 'solution/admin/faq-topic/delete-faq-topic',
    swagger: {
      tags: ['SOLUTION (FAQ TOPIC) - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
   * * ===============================================
   * PUBLIC
   * * ===============================================
   */
  'GET /api/v1/public/solution/faq-topic': {
    action: 'solution/public/faq-topic/get-all-faq-topics',
    swagger: {
      tags: ['SOLUTION (FAQ TOPIC) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/faq-topic/:id': {
    action: 'solution/public/faq-topic/get-one-faq-topic',
    swagger: {
      tags: ['SOLUTION (FAQ TOPIC) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/solution/get-topics-platform': {
    action: 'solution/public/faq-topic/get-topics-by-platform',
    swagger: {
      tags: ['SOLUTION (FAQ TOPIC) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
