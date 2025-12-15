module.exports = {
  friendlyName: 'Update superadmin profile',
  description: 'Update current superadmin profile information',

  inputs: {
    firstName: {
      type: 'string',
      description: 'First name'
    },
    lastName: {
      type: 'string',
      description: 'Last name'
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
      description: 'SuperAdmin not authenticated'
    },
    usernameAlreadyInUse: {
      statusCode: 409,
      description: 'Username already taken'
    }
  },

  fn: async function (inputs, exits) {
    if (!this.req.superAdmin) {
      return exits.unauthorized({
        message: 'SuperAdmin not authenticated'
      });
    }

    try {
      if (inputs.username) {
        const existingSuperAdmin = await SuperAdmin.findOne({
          username: inputs.username,
          id: { '!=': this.req.superAdmin.id }
        });

        if (existingSuperAdmin) {
          throw 'usernameAlreadyInUse';
        }
      }

      // Construire les données à mettre à jour
      const updateData = {};
      if (inputs.firstName) updateData.firstName = inputs.firstName;
      if (inputs.lastName) updateData.lastName = inputs.lastName;
      if (inputs.username !== undefined) updateData.username = inputs.username;

      // Mettre à jour le profil
      const updatedSuperAdmin = await SuperAdmin.updateOne({ id: this.req.superAdmin.id })
        .set(updateData);

      return exits.success({
        message: 'Profile updated successfully',
        superAdmin: {
          id: updatedSuperAdmin.id,
          firstName: updatedSuperAdmin.firstName,
          lastName: updatedSuperAdmin.lastName,
          username: updatedSuperAdmin.username,
          email: updatedSuperAdmin.email,
          role: updatedSuperAdmin.role
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
