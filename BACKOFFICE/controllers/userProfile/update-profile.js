module.exports = {
  friendlyName: 'Update user profile',
  description: 'Update current user profile information',

  inputs: {
    firstName: {
      type: 'string',
      description: 'User first name'
    },
    lastName: {
      type: 'string',
      description: 'User last name'
    },
    username: {
      type: 'string',
      description: 'Username'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Profile updated successfully'
    },
    unauthorized: {
      statusCode: 401,
      description: 'User not authenticated'
    },
    usernameAlreadyInUse: {
      statusCode: 409,
      description: 'Username already taken'
    }
  },

  fn: async function (inputs, exits) {
    // Vérifier le username s'il est fourni
    if (!this.req.user) {
      return exits.unauthorized({
        success: false,
        message: 'User not authenticated'
      });
    }

    try {
      if (inputs.username) {
        const existingUser = await User.findOne({
          username: inputs.username,
          id: { '!=': this.req.user.id }
        });

        if (existingUser) {
          throw 'usernameAlreadyInUse';
        }
      }

      // Construire les données à mettre à jour
      const updateData = {};
      if (inputs.firstName) updateData.firstName = inputs.firstName;
      if (inputs.lastName) updateData.lastName = inputs.lastName;
      if (inputs.username !== undefined) updateData.username = inputs.username;

      // Mettre à jour le profil
      const updatedUser = await User.updateOne({ id: this.req.user.id })
        .set(updateData);

      return exits.success({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          username: updatedUser.username,
          email: updatedUser.email
        }
      });

    } catch (error) {
      if (error === 'usernameAlreadyInUse') {
        return exits.usernameAlreadyInUse({
          message: 'This username is already taken'
        });
      }
      throw error;
    }
  }
};
