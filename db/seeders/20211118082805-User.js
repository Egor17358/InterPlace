'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Users', [{
      first_name: 'admin',
      last_name: 'admin',
      email: 'admin@admin.ru',
      password: 'admin',
      isadmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ], {});

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
};
