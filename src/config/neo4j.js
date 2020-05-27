const { NEO4J_ENDPOINT, NEO4J_USERNAME, NEO4J_PASSWORD } = process.env;

if (!NEO4J_ENDPOINT || !NEO4J_PASSWORD || !NEO4J_USERNAME) {
  console.error('Env variables for Neo4j missing!');
  process.exit(1);
}

module.exports = {
  NEO4J_ENDPOINT,
  NEO4J_USERNAME,
  NEO4J_PASSWORD,
};
