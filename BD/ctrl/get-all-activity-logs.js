module.exports = {
  friendlyName: 'Get all activity logs',
  description: 'Récupérer les logs d\'activité de tous les administrateurs (réservé aux admins privilégiés)',

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
    },
    startDate: {
      type: 'string',
      columnType: 'datetime',
      description: 'Date de début (ISO string)'
    },
    endDate: {
      type: 'string',
      columnType: 'datetime',
      description: 'Date de fin (ISO string)'
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
      // Seuls main, admin et analyst peuvent voir tous les logs
      if (!this.req.admin || !['main', 'admin', 'analyst'].includes(this.req.admin.role)) {
        throw 'forbidden';
      }

      const skip = (inputs.page - 1) * inputs.limit;
      let criteria = {};

      if (inputs.adminId) {
        criteria.admin = inputs.adminId;
      }

      if (inputs.action) {
        criteria.action = { contains: inputs.action };
      }

      if (inputs.targetType) {
        criteria.targetType = inputs.targetType;
      }

      // Filtrage par date
      if (inputs.startDate || inputs.endDate) {
        criteria.createdAt = {};
        if (inputs.startDate) {
          criteria.createdAt['>='] = new Date(inputs.startDate).getTime();
        }
        if (inputs.endDate) {
          criteria.createdAt['<='] = new Date(inputs.endDate).getTime();
        }
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
          admin: log.admin ? {
            id: log.admin.id,
            firstName: log.admin.firstName,
            lastName: log.admin.lastName,
            email: log.admin.email,
            role: log.admin.role
          } : { id: 'unknown', firstName: 'Admin', lastName: 'Inconnu' },
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          details: log.details,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
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
          message: 'Vous n\'avez pas les droits suffisants pour consulter ces logs.'
        });
      }
      throw error;
    }
  }
};
