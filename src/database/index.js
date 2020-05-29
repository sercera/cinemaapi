/* eslint-disable prefer-rest-params */
const neo4j = require('neo4j-driver');

const { NEO4J_ENDPOINT, NEO4J_PASSWORD, NEO4J_USERNAME } = require('../config/neo4j');

const { driverSessionPlugin } = require('../plugins/driver_session');

const driver = neo4j.driver(
  NEO4J_ENDPOINT,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
);

const mainSession = driverSessionPlugin(driver);

module.exports = {
  mainSession,
};
