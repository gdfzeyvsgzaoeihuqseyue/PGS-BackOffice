module.exports = {
  friendlyName: 'Get one all activity log',
  description: 'Récupérer un log d\'activité spécifique par son ID (accès étendu)',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'L\'ID du log d\'activité à récupérer'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Log récupéré avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Log non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Récupérer le log spécifique
      const log = await AdminActivityLog.findOne({ id: inputs.id })
        .populate('admin');

      if (!log) {
        return exits.notFound({ message: 'Log d\'activité non trouvé.' });
      }

      // Mapper la réponse pour un format cohérent
      const mappedLog = {
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
      };

      return exits.success({
        log: mappedLog
      });

    } catch (error) {
      throw error;
    }
  }
};
