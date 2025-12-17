module.exports = {
  friendlyName: 'Inviter administrateur',
  description: 'Inviter un nouvel administrateur (réservé aux admins main)',

  inputs: {
    firstName: {
      type: 'string',
      required: true,
      description: 'Prénom de l\'administrateur'
    },
    lastName: {
      type: 'string',
      required: true,
      description: 'Nom de l\'administrateur'
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'Adresse email de l\'administrateur'
    },
    role: {
      type: 'string',
      isIn: ['admin', 'moderator', 'support', 'analyst'],
      defaultsTo: 'moderator',
      description: 'Rôle de l\'administrateur'
    },
    permissions: {
      type: 'json',
      defaultsTo: {},
      description: 'Permissions spécifiques'
    }
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'Invitation envoyée avec succès'
    },
    emailAlreadyInUse: {
      statusCode: 409,
      description: 'Email déjà utilisé'
    },
    forbidden: {
      statusCode: 403,
      description: 'Action non autorisée'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier que l'admin connecté a le rôle "main"
      if (!this.req.admin || this.req.admin.role !== 'main') {
        throw 'forbidden';
      }

      const email = inputs.email.toLowerCase();

      // Vérifier si l'email existe déjà
      const existingEmail = await Admin.findOne({
        email: email
      });

      if (existingEmail) {
        throw 'emailAlreadyInUse';
      }

      // Générer un mot de passe temporaire aléatoire
      const tempPassword = await sails.helpers.security.generateToken.with({ tokenLength: 16 });

      // Générer le token d'invitation
      const invitationToken = await sails.helpers.security.generateToken.with({ tokenLength: 32 });
      const tokenExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 heures

      // Créer le compte administrateur inactif
      const newAdmin = await Admin.create({
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        email: email,
        password: tempPassword,
        role: inputs.role,
        permissions: inputs.permissions,
        status: 'pending',
        emailVerified: false,
        emailProofToken: invitationToken,
        emailProofTokenExpiresAt: tokenExpiresAt,
        createdBy: this.req.admin.id
      }).fetch();

      // Envoyer l'email d'invitation
      try {
        await sails.helpers.sender.email.with({
          layout: 'default-layout',
          template: 'admin/invitation',
          to: email,
          subject: 'Invitation à rejoindre l\'administration PGS',
          appSlug: 'pgs',
          templateData: {
            firstName: inputs.firstName,
            inviterName: `${this.req.admin.firstName} ${this.req.admin.lastName}`,
            role: inputs.role,
            invitationLink: `${sails.config.custom.appConfig.pgs.urls.adminSpace}/auth/accept-invitation?token=${invitationToken}`,
            expirationDelay: '24 heures'
          }
        });
      } catch (emailError) {
        sails.log.error('Erreur lors de l\'envoi de l\'email d\'invitation:', emailError);
      }

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: 'invite_admin',
        targetType: 'admin',
        targetId: newAdmin.id,
        details: {
          invitedEmail: newAdmin.email,
          role: newAdmin.role
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: 'Invitation envoyée avec succès',
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          role: newAdmin.role
        }
      });

    } catch (error) {
      if (error === 'emailAlreadyInUse') {
        return exits.emailAlreadyInUse({
          message: 'Cette adresse email est déjà utilisée'
        });
      }
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Seul un administrateur "main" peut inviter d\'autres administrateurs'
        });
      }
      throw error;
    }
  }
};
