const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');

dotenv.config();

console.log(process.env.NEO4J_ENDPOINT);
const driver = neo4j.driver(
  process.env.NEO4J_ENDPOINT,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

module.exports = driver;
