module.exports = {

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
