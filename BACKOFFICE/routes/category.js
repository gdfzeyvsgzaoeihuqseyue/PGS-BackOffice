module.exports = {

  /**
  * ===============================================
  * ADMIN
  * ===============================================
 */
  'POST /api/v1/admin/blog/add-category': {
    action: 'blog/admin/category/add-category',
    swagger: {
      tags: ['ARTICLE (CATEGORIE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/blog/update-category/:id': {
    action: 'blog/admin/category/update-category',
    swagger: {
      tags: ['ARTICLE (CATEGORIE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/blog/delete-category/:id': {
    action: 'blog/admin/category/delete-category',
    swagger: {
      tags: ['ARTICLE (CATEGORIE) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
