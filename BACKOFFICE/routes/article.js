module.exports = {

  /**
   * ===============================================
   * ADMIN
   * ===============================================
  */
  'POST /api/v1/admin/blog/add-article': {
    action: 'blog/admin/article/add-article',
    swagger: {
      tags: ['ARTICLE (BLOG) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'PUT /api/v1/admin/blog/update-article/:id': {
    action: 'blog/admin/article/update-article',
    swagger: {
      tags: ['ARTICLE (BLOG) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
  'DELETE /api/v1/admin/blog/delete-article/:id': {
    action: 'blog/admin/article/delete-article',
    swagger: {
      tags: ['ARTICLE (BLOG) - ADMIN'],
      'x-groups': ['full_access']
    }
  },
};
