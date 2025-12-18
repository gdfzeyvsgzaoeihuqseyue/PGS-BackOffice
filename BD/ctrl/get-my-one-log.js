module.exports = {
  friendlyName: 'Get one activity log',
  description: 'Récupérer un log d\'activité personnel spécifique par son ID',

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
      // Récupérer le log spécifique en s'assurant qu'il appartient à l'admin connecté
      const log = await AdminActivityLog.findOne({
        id: inputs.id,
        admin: this.req.admin.id
      }).populate('admin');

      if (!log) {
        return exits.notFound({ message: 'Log d\'activité non trouvé ou vous n\'avez pas les droits pour le consulter.' });
      }

      // Mapper la réponse
      const mappedLog = {
        id: log.id,
        admin: log.admin ? {
          id: log.admin.id,
          firstName: log.admin.firstName,
          lastName: log.admin.lastName,
          email: log.admin.email,
          role: log.admin.role
        } : null,
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
