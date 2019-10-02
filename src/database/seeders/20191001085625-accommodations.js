/* eslint-disable no-unused-vars */
/**
 * @func up
 * @param {*} queryInterface
 * @param {*} Sequelize
 * @return {func} bulkInsert
 */
export function up(queryInterface, Sequelize) {
  return queryInterface.bulkInsert('Accomodations', [{
    accommodation_name: 'Kigali Marriott Hotel',
    location: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    accommodation_name: 'Kigali Serena Hotel',
    location: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    accommodation_name: 'Kigali Radisson Blu Hotel',
    location: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    accommodation_name: 'Four Seasons Hotel',
    location: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    accommodation_name: 'EKO Hotels & Suites',
    location: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  }], {});
}
/**
 * @func down
 * @param {*} queryInterface
 * @param {*} Sequelize
 * @returns {func} bulkDelete
 */
export function down(queryInterface, Sequelize) {
  return queryInterface.bulkDelete('Accomodations', null, {});
}
