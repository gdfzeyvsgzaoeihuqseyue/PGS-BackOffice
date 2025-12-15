module.exports = {


  /**
  * ===============================================
  * ADMIN
  * ===============================================
 */
  'POST /api/v1/admin/blog/add-author': {
    action: 'blog/admin/author/add-author',
    swagger: {
      tags: ['ARTICLE (AUTEUR) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/blog/update-author/:id': {
    action: 'blog/admin/author/update-author',
    swagger: {
      tags: ['ARTICLE (AUTEUR) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/blog/delete-author/:id': {
    action: 'blog/admin/author/delete-author',
    swagger: {
      tags: ['ARTICLE (AUTEUR) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
