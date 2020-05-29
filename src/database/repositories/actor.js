const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');

class ActorRepository extends BaseRepository {
  async getActorsForMovie(movieId) {
    return mainSession.run(`MATCH (a:Actor)-[:ACTS_IN]->(m:Movie) WHERE ID(m)=${movieId} return a`, { cacheKey: this.name });
  }
}

module.exports = new ActorRepository('Actor', { cache: true, imageProperty: 'imageUrl' });
