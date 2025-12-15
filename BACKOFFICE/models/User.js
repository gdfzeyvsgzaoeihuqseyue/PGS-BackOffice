module.exports = {
  attributes: {
    firstName: {
      type: 'string',
      required: true,
      columnName: 'first_name'
    },
    lastName: {
      type: 'string',
      required: true,
      columnName: 'last_name'
    },
    username: {
      type: 'string',
      unique: true,
      allowNull: true
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true
    },
    password: {
      type: 'string',
      required: true,
      protect: true
    },
    emailVerified: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'email_verified'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_active'
    },
    lastLogin: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'last_login'
    },
    userAccess: {
      collection: 'useraccess',
      via: 'user'
    }
  },

  customToJSON: function() {
    return _.omit(this, ['password']);
  },

  beforeCreate: async function(values, proceed) {
    const hashedPassword = await sails.helpers.security.passwordHash(values.password);
    values.password = hashedPassword;
    return proceed();
  },

  beforeUpdate: async function(values, proceed) {
    if (values.password) {
      const hashedPassword = await sails.helpers.security.passwordHash(values.password);
      values.password = hashedPassword;
    }
    return proceed();
  }
};
