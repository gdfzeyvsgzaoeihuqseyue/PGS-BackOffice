module.exports = {
  friendlyName: 'Create service',
  description: 'Créer un nouveau service',

  inputs: {
    name: {
      type: 'string',
      required: true,
      description: 'Nom du service (ex: "Suitops", "Templix")'
    },
    domain: {
      type: 'string',
      required: true,
      isURL: true,
      description: 'Domaine du service (ex: "https://suitops.com")'
    },
    description: {
      type: 'string',
      description: 'Description du service'
    },
    allowedOrigins: {
      type: 'json',
      defaultsTo: [],
      description: 'Liste des origines autorisées pour CORS'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true,
      description: 'Activer immédiatement le service'
    }
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Service créé avec succès'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    },
    serviceAlreadyExists: {
      statusCode: 409,
      description: 'Un service avec ce nom ou domaine existe déjà'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que seuls main et admin peuvent créer
      if (!this.req.admin ||
        !['main', 'admin'].includes(this.req.admin.role)) {
        throw 'forbidden';
      }

      // Vérifier que le nom ou domaine n'existe pas
      const existingService = await Service.findOne({
        or: [
          { name: inputs.name },
          { domain: inputs.domain }
        ]
      });

      if (existingService) {
        throw 'serviceAlreadyExists';
      }

      // Créer le service
      const newService = await Service.create({
        name: inputs.name,
        domain: inputs.domain,
        description: inputs.description,
        allowedOrigins: inputs.allowedOrigins,
        isActive: inputs.isActive
      }).fetch();

      // Logger la création
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: 'create_service',
        targetType: 'service',
        targetId: newService.id,
        details: {
          serviceName: newService.name,
          serviceDomain: newService.domain,
          isActive: newService.isActive
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: 'Service créé avec succès',
        service: {
          id: newService.id,
          name: newService.name,
          domain: newService.domain,
          description: newService.description,
          apiKey: newService.apiKey,
          allowedOrigins: newService.allowedOrigins,
          isActive: newService.isActive,
          createdAt: newService.createdAt
        },
        warnings: [
          '⚠️ Conservez l\'API Key en lieu sûr',
          'Cette clé est nécessaire pour les opérations de gestion des accès'
        ]
      });

    } catch (error) {
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Seuls les roles main et admin peuvent créer des services'
        });
      }
      if (error === 'serviceAlreadyExists') {
        return exits.serviceAlreadyExists({
          message: 'Un service avec ce nom ou ce domaine existe déjà'
        });
      }
      throw error;
    }
  }
};
