module.exports = {
  friendlyName: 'Get learner',
  description: 'Récupérer les détails d\'un apprenant par ID',

  inputs: {
    id: {
      type: 'string',
      required: true,
      description: 'ID de l\'apprenant'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Apprenant récupéré avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Apprenant non trouvé'
    }
  },

  fn: async function (inputs, exits) {
    const learner = await Learner.findOne({ id: inputs.id });

    if (!learner) {
      return exits.notFound({ message: 'Apprenant non trouvé' });
    }

    // Récupérer les services associés
    const servicesAccess = await LearnerAccess.find({ learner: inputs.id })
      .populate('service');

    const services = servicesAccess.map(access => ({
      accessId: access.id,
      serviceId: access.service.id,
      name: access.service.name,
      domain: access.service.domain,
      role: access.role,
      isActive: access.isActive,
      lastAccess: access.lastAccess,
      enrollmentDate: access.enrollmentDate,
      progress: access.progress
    }));

    return exits.success({
      learner: {
        id: learner.id,
        firstName: learner.firstName,
        lastName: learner.lastName,
        username: learner.username,
        email: learner.email,
        emailVerified: learner.emailVerified,
        isActive: learner.isActive,
        phoneNumber: learner.phoneNumber,
        lastLogin: learner.lastLogin,
        createdAt: learner.createdAt
      },
      services: services
    });
  }
};
