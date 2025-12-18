module.exports = {
  friendlyName: 'Accepter invitation administrateur',
  description: 'Permettre à un administrateur invité de définir son mot de passe et activer son compte',

  inputs: {
    token: {
      type: 'string',
      required: true,
      description: 'Token d\'invitation reçu par email'
    },
    password: {
      type: 'string',
      required: true,
      minLength: 10,
      description: 'Nouveau mot de passe choisi'
    },
    firstName: {
      type: 'string',
      description: 'Confirmer ou corriger le prénom'
    },
    lastName: {
      type: 'string',
      description: 'Confirmer ou corriger le nom'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Compte activé avec succès'
    },
    invalidToken: {
      statusCode: 400,
      description: 'Token invalide ou expiré'
    },
    serverError: {
      statusCode: 500
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Rechercher l'admin avec le token valide
      const admin = await Admin.findOne({
        emailProofToken: inputs.token
      });

      if (!admin) {
        throw 'invalidToken';
      }

      // Vérifier expiration
      if (admin.emailProofTokenExpiresAt < Date.now()) {
        throw 'invalidToken';
      }

      // Mettre à jour l'admin
      const updateData = {
        password: inputs.password,
        status: 'active',
        emailVerified: true,
        emailProofToken: '',
        emailProofTokenExpiresAt: 0
      };

      if (inputs.firstName) updateData.firstName = inputs.firstName;
      if (inputs.lastName) updateData.lastName = inputs.lastName;

      await Admin.updateOne({ id: admin.id }).set(updateData);

      // Logger l'activation
      await AdminActivityLog.create({
        admin: admin.id,
        action: 'activate_account',
        targetType: 'admin',
        targetId: admin.id,
        details: {
          method: 'invitation_token'
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      const maskedEmail = await sails.helpers.utils.maskEmail.with({ email: admin.email });

      return exits.success({
        message: 'Compte activé avec succès. Vous pouvez maintenant vous connecter.',
        maskedEmail: maskedEmail
      });

    } catch (error) {
      if (error === 'invalidToken') {
        return exits.invalidToken({
          message: 'Le lien d\'invitation est invalide ou a expiré.'
        });
      }
      throw error;
    }
  }
};
