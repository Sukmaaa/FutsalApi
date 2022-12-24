"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("products", [
      {
        name: "RWANDA Beans",
        price: 299900,
        stock: 200,
        description:
          "Teasia's Rwandan coffee is another single-origin, sustainably sourced, 100% Arabica offering. These beans are grown by Lake Kivu around 5,000 to 6,000 feet above sea level. The beans are wet-processed and medium-dark roasted at an artisanal roaster. The brew has a rich, deep finish with clean bright flavors.Teasia's Rwandan coffee is another single-origin, sustainably sourced.",
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
