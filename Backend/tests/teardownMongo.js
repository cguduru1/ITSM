// CommonJS globalTeardown for Jest
const { closeDatabase } = require("./setupMongo");

module.exports = async () => {
  await closeDatabase();
};
