module.exports = {

  /**
   * * ===============================================
   * ADMIN
   * * ===============================================
   */
  'POST /api/v1/admin/event': {
    action: 'event/admin/add-event',
    swagger: {
      tags: ['EVENEMENT - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/event/:id': {
    action: 'event/admin/update-event',
    swagger: {
      tags: ['EVENEMENT - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/event/:id': {
    action: 'event/admin/delete-event',
    swagger: {
      tags: ['EVENEMENT - ADMIN'],
      'x-groups': ['full_access']
    }
  },


  /**
   * * ===============================================
   * PUBLIC
   * * ===============================================
   */
  'GET /api/v1/public/get-events': {
    action: 'event/get-all-event',
    swagger: {
      tags: ['EVENEMENT - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/get-event/:id': {
    action: 'event/get-one-event',
    swagger: {
      tags: ['EVENEMENT - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
