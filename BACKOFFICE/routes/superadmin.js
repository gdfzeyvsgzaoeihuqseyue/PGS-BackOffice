module.exports = {

  /**
   * * ===============================================
   * AUTHENTIFICATION
   * * ===============================================
   */
  'POST /api/v1/superadmin/auth/register': {
    action: 'superadmin/auth/register',
    policy: 'is-superadmin'
  },
  'POST /api/v1/superadmin/auth/login': {
    action: 'superadmin/auth/login'
  },
  'POST /api/v1/superadmin/auth/logout': {
    action: 'superadmin/auth/logout',
    policy: 'is-superadmin'
  },
  'POST /api/v1/superadmin/auth/refresh-token': {
    action: 'superadmin/auth/refresh-token'
  },

  /**
   * * ===============================================
   * PROFIL
   * * ===============================================
   */
  'GET /api/v1/superadmin/profile': {
    action: 'superadmin/profile/get-profile',
    policy: 'is-superadmin'
  },
  'PUT /api/v1/superadmin/profile': {
    action: 'superadmin/profile/update-profile',
    policy: 'is-superadmin'
  },



  /**
  * * ===============================================
  * GESTION DES UTILISATEURS
  * * ===============================================
  */
  'GET /api/v1/superadmin/user/list': {
    action: 'superadmin/manage/list-users',
    policy: 'is-superadmin'
  },
  'POST /api/v1/superadmin/user/manage': {
    action: 'superadmin/manage/manage-user',
    policy: 'is-superadmin'
  },


  /**
  * * ===============================================
  * GESTION DES APPRENANTS
  * * ===============================================
  */
  'GET /api/v1/superadmin/leaner/list': {
    action: 'superadmin/manage/list-learners',
    policy: 'is-superadmin'
  },
  'POST /api/v1/superadmin/leaner/manage': {
    action: 'superadmin/manage/manage-learner',
    policy: 'is-superadmin'
  },

  /**
  * * ===============================================
  * LOGS DES ACTIVITES
  * * ===============================================
  */
  'GET /api/v1/superadmin/activity-logs': {
    action: 'superadmin/other/get-activity-logs',
    policy: 'is-superadmin'
  }

};
