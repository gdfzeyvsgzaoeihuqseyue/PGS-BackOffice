module.exports = {
  friendlyName: 'Get activity logs',
  description: 'Récupérer les logs d\'activité des administrateurs',

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
    adminId: {
      type: 'string',
      description: 'Filtrer par ID de l\'administrateur'
    },
    action: {
      type: 'string',
      description: 'Filtrer par type d\'action'
    },
    targetType: {
      type: 'string',
      isIn: ['user', 'learner', 'admin', 'service', 'system'],
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

  fn: async function (inputs, exits) {
    try {
      // Vérifier que l'admin est connecté
      if (!this.req.admin) {
        return exits.forbidden({
          message: 'Authentification requise.'
        });
      }

      const skip = (inputs.page - 1) * inputs.limit;

      // Construire la requête - FORCER le filtre sur l'admin connecté
      let criteria = {
        admin: this.req.admin.id
      };

      if (inputs.action) {
        criteria.action = { contains: inputs.action };
      }

      if (inputs.targetType) {
        criteria.targetType = inputs.targetType;
      }

      // Récupérer les logs
      const logs = await AdminActivityLog.find(criteria)
        .populate('admin')
        .limit(inputs.limit)
        .skip(skip)
        .sort('createdAt DESC');

      // Compter le total
      const totalLogs = await AdminActivityLog.count(criteria);

      return exits.success({
        logs: logs.map(log => ({
          id: log.id,
          admin: this.req.admin ? {
            id: this.req.admin.id,
            firstName: this.req.admin.firstName,
            lastName: this.req.admin.lastName,
            role: this.req.admin.role
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
      throw error;
    }
  }
};
