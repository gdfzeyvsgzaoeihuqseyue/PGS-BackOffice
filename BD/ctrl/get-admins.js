module.exports = {
  friendlyName: 'Get admins',
  description: 'Récupérer la liste des administrateurs avec filtrage',

  inputs: {
    page: {
      type: 'number',
      defaultsTo: 1,
      description: 'Page number'
    },
    limit: {
      type: 'number',
      defaultsTo: 20,
      description: 'Items per page'
    },
    status: {
      type: 'string',
      isIn: ['active', 'pending', 'all'],
      defaultsTo: 'all',
      description: 'Filtrer par statut: active (accepté), pending (invité mais pas accepté), all'
    },
    search: {
      type: 'string',
      description: 'Recherche par nom, prénom ou email'
    },
    role: {
      type: 'string',
      description: 'Filtrer par rôle'
    }
  },

  exits: {
    success: {
      statusCode: 200,
      description: 'Liste récupérée avec succès'
    },
    forbidden: {
      statusCode: 403,
      description: 'Non autorisé'
    }
  },

  fn: async function (inputs, exits) {
    try {
      // Vérifier les droits (main ou admin)
      if (!this.req.admin || !['main', 'admin'].includes(this.req.admin.role)) {
        throw 'forbidden';
      }

      let criteria = {};

      // Filtrage par statut
      if (inputs.status === 'active') {
        criteria.isActive = true;
      } else if (inputs.status === 'pending') {
        criteria.isActive = false;
        // On suppose que pending signifie inactive + token présent
        criteria.emailProofToken = { '!=': '' };
      }

      // Filtrage par rôle
      if (inputs.role) {
        criteria.role = inputs.role;
      }

      // Recherche textuelle (si supporté par la DB ou simple contains)
      if (inputs.search) {
        criteria.or = [
          { email: { contains: inputs.search.toLowerCase() } },
          { firstName: { contains: inputs.search } },
          { lastName: { contains: inputs.search } },
          { username: { contains: inputs.search } }
        ];
      }

      const total = await Admin.count(criteria);

      const admins = await Admin.find(criteria)
        .limit(inputs.limit)
        .skip((inputs.page - 1) * inputs.limit)
        .sort('createdAt DESC');

      // Mapper les résultats
      const mappedAdmins = admins.map(admin => {
        let status = 'active';
        if (!admin.isActive) {
          if (admin.emailProofToken) {
            status = 'pending_invite';
          } else {
            status = 'inactive';
          }
        }

        return {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
          status: status, // active, pending_invite, inactive
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          invitedBy: admin.createdBy // ID de l'inviteur
        };
      });

      return exits.success({
        admins: mappedAdmins,
        pagination: {
          page: inputs.page,
          limit: inputs.limit,
          total: total,
          totalPages: Math.ceil(total / inputs.limit)
        }
      });

    } catch (error) {
      if (error === 'forbidden') {
        return exits.forbidden({
          message: 'Accès refusé.'
        });
      }
      throw error;
    }
  }
};
