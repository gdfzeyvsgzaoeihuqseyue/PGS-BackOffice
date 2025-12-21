module.exports = {
  attributes: {
    question: {
      type: 'string',
      required: true,
      description: 'La question fréquemment posée.'
    },
    answer: {
      type: 'string',
      required: true,
      description: 'La réponse à la question.'
    },
    topic: {
      model: 'SolutionFaqTopic',
      required: true,
      description: 'Le sujet (topic) auquel appartient cette FAQ.'
    },
    status: {
      type: 'string',
      description: 'Le statut de la FAQ.',
      isIn: ['active', 'inactive'],
      defaultsTo: 'active'
    },
    isUseful: {
      type: 'number',
      description: 'Nombre d\'utilisateurs ayant trouvé cette FAQ utile.',
      defaultsTo: 0
    },
    isUseless: {
      type: 'number',
      description: 'Nombre d\'utilisateurs ayant trouvé cette FAQ inutile.',
      defaultsTo: 0
    }
  }
};
