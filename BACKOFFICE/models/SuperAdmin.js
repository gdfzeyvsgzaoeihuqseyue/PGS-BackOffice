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
    role: {
      type: 'string',
      isIn: ['main', 'admin', 'moderator', 'support', 'analyst'],
      defaultsTo: 'moderator',
      description: 'Rôle du superadmin: main (propriétaire), admin, moderator, support, analyst'
    },
    permissions: {
      type: 'json',
      defaultsTo: {},
      description: 'Permissions détaillées du superadmin'
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'is_active'
    },
    emailVerified: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'email_verified'
    },
    lastLogin: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'last_login'
    },
    createdBy: {
      type: 'string',
      columnName: 'created_by',
      description: 'ID du superadmin qui a créé ce compte'
    },
    twoFactorEnabled: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'two_factor_enabled'
    },
    twoFactorSecret: {
      type: 'string',
      columnName: 'two_factor_secret',
      protect: true
    },
    activityLogs: {
      collection: 'superadminactivitylog',
      via: 'superAdmin'
    }
  },

  customToJSON: function () {
    return _.omit(this, ['password', 'twoFactorSecret']);
  },

  beforeCreate: async function (values, proceed) {
    const hashedPassword = await sails.helpers.security.passwordHash(values.password);
    values.password = hashedPassword;
    return proceed();
  },

  beforeUpdate: async function (values, proceed) {
    if (values.password) {
      const hashedPassword = await sails.helpers.security.passwordHash(values.password);
      values.password = hashedPassword;
    }
    return proceed();
  }
};
