module.exports = {
  friendlyName: 'Register superadmin',
  description: 'Créer un nouveau compte superadmin (réservé aux admins main)',
  
  inputs: {
    firstName: {
      type: 'string',
      required: true,
      description: 'Prénom du superadmin'
    },
    lastName: {
      type: 'string',
      required: true,
      description: 'Nom du superadmin'
    },
    username: {
      type: 'string',
      description: 'Nom d\'utilisateur (optionnel)'
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'Adresse email du superadmin'
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
      description: 'Rôle du superadmin'
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
      description: 'SuperAdmin créé avec succès'
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
  
  fn: async function(inputs, exits) {
    try {
      // Vérifier que l'admin connecté a le rôle "main"
      if (!this.req.superAdmin || this.req.superAdmin.role !== 'main') {
        throw 'forbidden';
      }
      
      // Vérifier si l'email existe déjà
      const existingEmail = await SuperAdmin.findOne({ 
        email: inputs.email.toLowerCase() 
      });
      
      if (existingEmail) {
        throw 'emailAlreadyInUse';
      }
      
      // Vérifier si le username existe (si fourni)
      if (inputs.username) {
        const existingUsername = await SuperAdmin.findOne({ 
          username: inputs.username 
        });
        
        if (existingUsername) {
          throw 'usernameAlreadyInUse';
        }
      }
      
      // Créer le compte superadmin
      const newSuperAdmin = await SuperAdmin.create({
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        username: inputs.username || null,
        email: inputs.email.toLowerCase(),
        password: inputs.password,
        role: inputs.role,
        permissions: inputs.permissions,
        createdBy: this.req.superAdmin.id
      }).fetch();
      
      // Logger l'action
      await SuperAdminActivityLog.create({
        superAdmin: this.req.superAdmin.id,
        action: 'create_superadmin',
        targetType: 'superadmin',
        targetId: newSuperAdmin.id,
        details: {
          newAdminEmail: newSuperAdmin.email,
          role: newSuperAdmin.role
        },
        ipAddress: this.req.ip,
        userAgent: this.req.headers['user-agent']
      });
      
      return exits.success({
        message: 'SuperAdmin créé avec succès',
        superAdmin: {
          id: newSuperAdmin.id,
          firstName: newSuperAdmin.firstName,
          lastName: newSuperAdmin.lastName,
          username: newSuperAdmin.username,
          email: newSuperAdmin.email,
          role: newSuperAdmin.role
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
          message: 'Seul un superadmin "main" peut créer d\'autres superadmins'
        });
      }
      throw error;
    }
  }
};
