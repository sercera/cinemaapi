const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');

class ActorRepository extends BaseRepository {
  async getAll(options) {
    const { limit, skip } = options;
    return mainSession.runOne(`
    MATCH 
    (a:Actor)
    WITH 
    count(*) AS cnt
    MATCH 
    (a:Actor)
    WITH a, cnt ORDER BY a.name SKIP ${skip} LIMIT ${limit}
    RETURN 
    { data:collect(a), total: cnt, limit: ${limit}, skip: ${skip} } AS actors`);
  }

  async getActorsForMovie(movieId) {
    return mainSession.run(`MATCH (a:Actor)-[:ACTS_IN]->(m:Movie) WHERE ID(m)=${movieId} return a`, { cacheKey: this.name });
  }
}

module.exports = new ActorRepository('Actor', { cache: true, imageProperty: 'imageUrl' });
