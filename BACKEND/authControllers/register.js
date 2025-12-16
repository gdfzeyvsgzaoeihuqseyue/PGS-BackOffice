module.exports = {
  friendlyName: 'Inviter administrateur',
  description: 'Créer un nouveau compte administrateur (réservé aux admins main)',

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
    username: {
      type: 'string',
      description: 'Nom d\'utilisateur (optionnel)'
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'Adresse email de ladministrateur'
    },
    password: {
      type: 'string',
      required: true,
      minLength: 10,
      description: 'Mot de passe (minimum 10 caractères)'
    },
    role: {
      type: 'string',
      isIn: ['admin', 'moderator', 'support', 'analyst'],
      defaultsTo: 'moderator',
      description: 'Rôle de ladministrateur'
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
      description: 'Administrateur invité avec succès'
    },
    emailAlreadyInUse: {
      statusCode: 409,
      description: 'Email déjà utilisé'
    },
    usernameAlreadyInUse: {
      statusCode: 409,
      description: 'Nom d\'utilisateur déjà pris'
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

      // Vérifier si l'email existe déjà
      const existingEmail = await Admin.findOne({
        email: inputs.email.toLowerCase()
      });

      if (existingEmail) {
        throw 'emailAlreadyInUse';
      }

      // Vérifier si le username existe (si fourni)
      if (inputs.username) {
        const existingUsername = await Admin.findOne({
          username: inputs.username
        });

        if (existingUsername) {
          throw 'usernameAlreadyInUse';
        }
      }

      // Créer le compte administrateur
      const newAdmin = await Admin.create({
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        username: inputs.username || null,
        email: inputs.email.toLowerCase(),
        password: inputs.password,
        role: inputs.role,
        permissions: inputs.permissions,
        createdBy: this.req.admin.id
      }).fetch();

      // Logger l'action
      await AdminActivityLog.create({
        admin: this.req.admin.id,
        action: 'create_admin',
        targetType: 'admin',
        targetId: newAdmin.id,
        details: {
          newAdminEmail: newAdmin.email,
          role: newAdmin.role
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });

      return exits.success({
        message: 'Admin créé avec succès',
        admin: {
          id: newAdmin.id,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          username: newAdmin.username,
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
      if (error === 'usernameAlreadyInUse') {
        return exits.usernameAlreadyInUse({
          message: 'Ce nom d\'utilisateur est déjà pris'
        });
      }
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Seul un administrateur "main" peut créer d\'autres administrateurs'
        });
      }
      throw error;
    }
  }
};
