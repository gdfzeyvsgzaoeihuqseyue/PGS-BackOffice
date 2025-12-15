module.exports = {
  friendlyName: 'Revoke service access',
  description: 'Revoke user access to a specific service',
  
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
    }
  },
  
  exits: {
    success: {
      statusCode: 200,
      description: 'Access revoked successfully'
    },
    accessNotFound: {
      statusCode: 404,
      description: 'Access record not found'
    }
  },
  
  fn: async function(inputs, exits) {
    try {
      const userAccess = await UserAccess.updateOne({
        user: inputs.userId,
        service: inputs.serviceId
      }).set({ isActive: false });
      
      if (!userAccess) {
        throw 'accessNotFound';
      }
      
      return exits.success({
        message: 'Access revoked successfully'
      });
      
    } catch (error) {
      if (error === 'accessNotFound') {
        return exits.accessNotFound({
          message: 'Access record not found'
        });
      }
      throw error;
    }
  }
};
