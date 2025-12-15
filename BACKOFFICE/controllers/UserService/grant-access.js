module.exports = {
  friendlyName: 'Grant service access',
  description: 'Grant a user access to a specific service',

  inputs: {
    userId: {
      type: 'string',
      required: true,
      description: 'User ID'
    },
    serviceId: {
      type: 'string',
      required: true,
      description: 'Service ID'
    },
    role: {
      type: 'string',
      isIn: ['user', 'admin', 'moderator'],
      defaultsTo: 'user',
      description: 'User role for this service'
    },
    customPermissions: {
      type: 'json',
      defaultsTo: {},
      description: 'Custom permissions object'
    }
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Access granted successfully'
    },
    reactivated: {
      statusCode: 200,
      description: 'Access reactivated successfully'
    },
    userNotFound: {
      statusCode: 404,
      description: 'User not found'
    },
    serviceNotFound: {
      statusCode: 404,
      description: 'Service not found'
    },
    accessAlreadyActive: {
      statusCode: 409,
      description: 'User already has active access to this service'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que l'utilisateur existe
      const user = await User.findOne({ id: inputs.userId });
      if (!user) {
        throw 'userNotFound';
      }

      // Vérifier que le service existe
      const service = await Service.findOne({ id: inputs.serviceId });
      if (!service) {
        throw 'serviceNotFound';
      }

      // Vérifier si l'accès existe déjà
      const existingAccess = await UserAccess.findOne({
        user: inputs.userId,
        service: inputs.serviceId
      });

      if (existingAccess) {
        // Si l'accès existe et est déjà actif
        if (existingAccess.isActive) {
          throw 'accessAlreadyActive';
        }

        // Si l'accès existe mais est inactif, le réactiver
        const reactivatedAccess = await UserAccess.updateOne({
          id: existingAccess.id
        }).set({
          isActive: true,
          role: inputs.role,
          customPermissions: inputs.customPermissions,
          lastAccess: new Date()
        });

        return exits.reactivated({
          message: 'Access reactivated successfully',
          access: {
            id: reactivatedAccess.id,
            userId: inputs.userId,
            serviceId: inputs.serviceId,
            role: reactivatedAccess.role,
            permissions: reactivatedAccess.customPermissions,
            isActive: reactivatedAccess.isActive
          }
        });
      }

      // Créer un nouvel accès
      const userAccess = await UserAccess.create({
        user: inputs.userId,
        service: inputs.serviceId,
        role: inputs.role,
        customPermissions: inputs.customPermissions,
        isActive: true
      }).fetch();

      return exits.success({
        message: 'Access granted successfully',
        access: {
          id: userAccess.id,
          userId: inputs.userId,
          serviceId: inputs.serviceId,
          role: userAccess.role,
          permissions: userAccess.customPermissions,
          isActive: userAccess.isActive
        }
      });

    } catch (error) {
      if (error === 'userNotFound') {
        return exits.userNotFound({ message: 'User not found' });
      }

      if (error === 'serviceNotFound') {
        return exits.serviceNotFound({ message: 'Service not found' });
      }

      if (error === 'accessAlreadyActive') {
        return exits.accessAlreadyActive({
          message: 'User already has active access to this service'
        });
      }

      throw error;
    }
  }
};
