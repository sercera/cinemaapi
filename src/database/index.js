/* eslint-disable prefer-rest-params */
const neo4j = require('neo4j-driver');

const { NEO4J_ENDPOINT, NEO4J_PASSWORD, NEO4J_USERNAME } = require('../config/neo4j');

const { mongoCachePlugin } = require('../plugins/mongo_cache');

const driver = neo4j.driver(
  NEO4J_ENDPOINT,
  neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
);

const mainSession = mongoCachePlugin(driver.session());
module.exports = {
  mainSession,
};
