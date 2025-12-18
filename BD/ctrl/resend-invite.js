module.exports = {
  friendlyName: 'Resend invitation',
  description: 'Renvoyer l\'email d\'invitation à un administrateur en attente',

  inputs: {
    adminId: {
      type: 'string',
      required: true,
      description: 'L\'ID de l\'admin invité'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Invitation renvoyée avec succès'
    },
    notFound: {
      statusCode: 404,
      description: 'Administrateur introuvable'
    },
    badRequest: {
      statusCode: 400,
      description: 'L\'administrateur est déjà actif ou n\'est pas en attente'
    },
    forbidden: {
      statusCode: 403,
      description: 'Non autorisé'
    }
  },

  fn: async function (inputs, exits) {
    try {
      const admin = await Admin.findOne({ id: inputs.adminId });

      if (!admin) {
        throw 'notFound';
      }

      // Vérifier si le compte est éligible au renvoi
      if (admin.status !== 'pending') {
        return exits.badRequest({
          message: 'Cet administrateur a déjà activé son compte.'
        });
      }

      // Générer un nouveau token ou prolonger l'actuel
      const invitationToken = await sails.helpers.security.generateToken.with({ tokenLength: 32 });
      const tokenExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 heures

      await Admin.updateOne({ id: admin.id }).set({
        emailProofToken: invitationToken,
        emailProofTokenExpiresAt: tokenExpiresAt
      });

      // Envoyer l'email
      try {
        await sails.helpers.sender.email.with({
          layout: 'default-layout',
          template: 'admin/invitation',
          to: admin.email,
          subject: 'Rappel : Invitation à rejoindre l\'administration PGS',
          appSlug: 'pgs',
          templateData: {
            firstName: admin.firstName,
            inviterName: `${this.req.admin.firstName} ${this.req.admin.lastName}`,
            role: admin.role,
            invitationLink: `${sails.config.custom.appConfig.pgs.urls.adminSpace}/auth/accept-invitation?token=${invitationToken}`,
            expirationDelay: '24 heures'
          }
        });
      } catch (emailError) {
        sails.log.error('Erreur renvoi invitation:', emailError);
        // Continuer même si l'email fail, pour logger l'action
      }

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: 'resend_invite',
        targetType: 'admin',
        targetId: admin.id,
        details: {
          invitedEmail: admin.email
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      const maskedEmail = await sails.helpers.utils.maskEmail.with({ email: admin.email });

      return exits.success({
        message: 'Invitation renvoyée avec succès',
        maskedEmail: maskedEmail
      });

    } catch (error) {
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Seul un administrateur principal peut effectuer cette action.'
        });
      }
      if (error === 'notFound') {
        return exits.notFound({ message: 'Admin introuvable.' });
      }
      throw error;
    }
  }
};
