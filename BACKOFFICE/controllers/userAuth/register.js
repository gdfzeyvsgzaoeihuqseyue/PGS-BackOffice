module.exports = {
  friendlyName: 'Register',
  description: 'Register a new user account',

  inputs: {
    firstName: {
      type: 'string',
      required: true,
      description: 'User first name'
    },
    lastName: {
      type: 'string',
      required: true,
      description: 'User last name'
    },
    username: {
      type: 'string',
      description: 'Optional username',
      allowNull: true
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'User email address'
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
      description: 'User password (minimum 8 characters)'
    }
  },

  exits: {
    success: {
      statusCode: 201,
      description: 'User registered successfully'
    },
    emailAlreadyInUse: {
      statusCode: 409,
      description: 'Email already registered'
    },
    usernameAlreadyInUse: {
      statusCode: 409,
      description: 'Username already taken'
    },
    invalidInput: {
      statusCode: 400,
      description: 'Invalid input data'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Valider l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputs.email)) {
        return exits.invalidInput({
          message: 'Invalid email format'
        });
      }

      // Valider le mot de passe
      if (inputs.password.length < 8) {
        return exits.invalidInput({
          message: 'Password must be at least 8 characters long'
        });
      }

      // Vérifier si l'email existe déjà
      const existingEmail = await User.findOne({
        email: inputs.email.toLowerCase()
      });

      if (existingEmail) {
        throw 'emailAlreadyInUse';
      }

      // Vérifier si le username existe (si fourni)
      if (inputs.username) {
        const existingUsername = await User.findOne({
          username: inputs.username
        });

        if (existingUsername) {
          throw 'usernameAlreadyInUse';
        }
      }

      // Créer le compte utilisateur
      const newUser = await User.create({
        firstName: inputs.firstName,
        lastName: inputs.lastName,
        username: inputs.username || null,
        email: inputs.email.toLowerCase(),
        password: inputs.password
      }).fetch();

      return exits.success({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          username: newUser.username,
          email: newUser.email,
          emailVerified: newUser.emailVerified,
          createdAt: newUser.createdAt
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

      sails.log.error('Registration error:', error);
      throw error;
    }
  }
};
