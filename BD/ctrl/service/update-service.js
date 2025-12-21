module.exports = {
  friendlyName: 'Update service',
  description: 'Mettre à jour les informations d\'un service',

  inputs: {
    serviceId: {
      type: 'string',
      required: true,
      description: 'ID du service à modifier'
    },
    name: {
      type: 'string',
      description: 'Nouveau nom du service'
    },
    domain: {
      type: 'string',
      isURL: true,
      description: 'Nouveau domaine'
    },
    description: {
      type: 'string',
      description: 'Nouvelle description'
    },
    allowedOrigins: {
      type: 'json',
      description: 'Nouvelles origines autorisées'
    },
    isActive: {
      type: 'boolean',
      description: 'Activer/désactiver le service'
    },
    regenerateApiKey: {
      type: 'boolean',
      defaultsTo: false,
      description: 'Régénérer l\'API key'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Service mis à jour avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Service non trouvé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    },
    nameAlreadyExists: {
      statusCode: 409,
      description: 'Un service avec ce nom existe déjà'
    },
    domainAlreadyExists: {
      statusCode: 409,
      description: 'Un service avec ce domaine existe déjà'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que seuls main et admin peuvent modifier
      if (!this.req.admin ||
        !['main', 'admin'].includes(this.req.admin.role)) {
        throw 'forbidden';
      }

      // Vérifier que le service existe
      const service = await Service.findOne({ id: inputs.serviceId });

      if (!service) {
        throw 'notFound';
      }

      // Vérifier unicité du nom si changé
      if (inputs.name && inputs.name !== service.name) {
        const existingName = await Service.findOne({
          name: inputs.name,
          id: { '!=': inputs.serviceId }
        });

        if (existingName) {
          throw 'nameAlreadyExists';
        }
      }

      // Vérifier unicité du domaine si changé
      if (inputs.domain && inputs.domain !== service.domain) {
        const existingDomain = await Service.findOne({
          domain: inputs.domain,
          id: { '!=': inputs.serviceId }
        });

        if (existingDomain) {
          throw 'domainAlreadyExists';
        }
      }

      // Construire les données de mise à jour
      const updateData = {};

      if (inputs.name) updateData.name = inputs.name;
      if (inputs.domain) updateData.domain = inputs.domain;
      if (inputs.description !== undefined) updateData.description = inputs.description;
      if (inputs.allowedOrigins) updateData.allowedOrigins = inputs.allowedOrigins;
      if (inputs.isActive !== undefined) updateData.isActive = inputs.isActive;

      // Régénérer l'API key si demandé
      if (inputs.regenerateApiKey) {
        const newApiKey = await sails.helpers.security.generateApiKey();
        updateData.apiKey = newApiKey;
      }

      // Mettre à jour le service
      const updatedService = await Service.updateOne({ id: inputs.serviceId })
        .set(updateData);

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: 'update_service',
        targetType: 'service',
        targetId: inputs.serviceId,
        details: {
          serviceName: updatedService.name,
          changes: updateData,
          apiKeyRegenerated: inputs.regenerateApiKey || false
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: 'Service mis à jour avec succès',
        service: {
          id: updatedService.id,
          name: updatedService.name,
          domain: updatedService.domain,
          description: updatedService.description,
          isActive: updatedService.isActive,
          allowedOrigins: updatedService.allowedOrigins,
          apiKey: updatedService.apiKey,
          updatedAt: updatedService.updatedAt
        },
        warnings: inputs.regenerateApiKey ? [
          'L\'API key a été régénérée. Les anciennes requêtes avec l\'ancienne clé échoueront.'
        ] : []
      });

    } catch (error) {
      if (error === 'notFound') {
        return exits.notFound({ message: 'Service non trouvé' });
      }
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Seuls les roles main et admin peuvent modifier les services'
        });
      }
      if (error === 'nameAlreadyExists') {
        return exits.nameAlreadyExists({
          message: 'Un service avec ce nom existe déjà'
        });
      }
      if (error === 'domainAlreadyExists') {
        return exits.domainAlreadyExists({
          message: 'Un service avec ce domaine existe déjà'
        });
      }
      throw error;
    }
  }
};
