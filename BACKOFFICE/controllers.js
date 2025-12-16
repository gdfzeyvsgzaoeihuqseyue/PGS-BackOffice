module.exports = {
  friendlyName: 'Get activity logs',
  description: 'Récupérer les logs d\'activité des superadmins',
  
  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      description: 'Numéro de page'
    },
    limit: {
      type: 'number',
      defaultsTo: 50,
      max: 200,
      description: 'Nombre d\'éléments par page'
    },
    superAdminId: {
      type: 'string',
      description: 'Filtrer par ID de superadmin'
    },
    action: {
      type: 'string',
      description: 'Filtrer par type d\'action'
    },
    targetType: {
      type: 'string',
      isIn: ['user', 'learner', 'superadmin', 'service', 'system'],
      description: 'Filtrer par type de cible'
    }
  },
  
  exits: {
    success: {
      statusCode: 200,
      description: 'Logs récupérés avec succès'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },
  
  fn: async function(inputs, exits) {
    try {
      // Vérifier que seul main, admin ou analyst peut voir les logs
      if (!this.req.superAdmin || 
          !['main', 'admin', 'analyst'].includes(this.req.superAdmin.role)) {
        throw 'forbidden';
      }
      
      const skip = (inputs.page - 1) * inputs.limit;
      
      // Construire la requête
      let criteria = {};
      
      if (inputs.superAdminId) {
        criteria.superAdmin = inputs.superAdminId;
      }
      
      if (inputs.action) {
        criteria.action = { contains: inputs.action };
      }
      
      if (inputs.targetType) {
        criteria.targetType = inputs.targetType;
      }
      
      // Récupérer les logs
      const logs = await SuperAdminActivityLog.find(criteria)
        .populate('superAdmin')
        .limit(inputs.limit)
        .skip(skip)
        .sort('createdAt DESC');
      
      // Compter le total
      const totalLogs = await SuperAdminActivityLog.count(criteria);
      
      return exits.success({
        logs: logs.map(log => ({
          id: log.id,
          superAdmin: log.superAdmin ? {
            id: log.superAdmin.id,
            firstName: log.superAdmin.firstName,
            lastName: log.superAdmin.lastName,
            email: log.superAdmin.email,
            role: log.superAdmin.role
          } : null,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          details: log.details,
          ipAddress: log.ipAddress,
          status: log.status,
          createdAt: log.createdAt
        })),
        pagination: {
          page: inputs.page,
          limit: inputs.limit,
          total: totalLogs,
          totalPages: Math.ceil(totalLogs / inputs.limit)
        }
      });
      
    } catch (error) {
      if (error === 'forbidden') {
        return exits.forbidden({ 
          message: 'Seuls les roles main, admin et analyst peuvent consulter les logs' 
        });
      }
      throw error;
    }
  }
};
