module.exports = {

  /**
   * ===============================================
   * PUBLIC
   * ===============================================
  */
  'GET /api/v1/public/blog/get-article': {
    action: 'blog/public/article/get-all-article',
    swagger: {
      tags: ['ARTICLE (BLOG) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/blog/get-article/:identifier': {
    action: 'blog/public/article/get-one-article',
    swagger: {
      tags: ['ARTICLE (BLOG) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },


  /**
  * ===============================================
  * PUBLIC
  * ===============================================
 */
  'GET /api/v1/public/blog/get-author': {
    action: 'blog/public/author/get-all-author',
    swagger: {
      tags: ['ARTICLE (AUTEUR) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/blog/author/:identifier': {
    action: 'blog/public/author/get-one-author',
    swagger: {
      tags: ['ARTICLE (AUTEUR) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },


  /**
  * ===============================================
  * PUBLIC
  * ===============================================
 */
  'GET /api/v1/public/blog/get-category': {
    action: 'blog/public/category/get-all-category',
    swagger: {
      tags: ['ARTICLE (CATEGORIE) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
  'GET /api/v1/public/blog/get-category/:identifier': {
    action: 'blog/public/category/get-one-category',
    swagger: {
      tags: ['ARTICLE (CATEGORIE) - PUBLIC'],
      'x-groups': ['restricted_endpoints']
    }
  },
};
