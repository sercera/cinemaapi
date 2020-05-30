const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');

class ActorRepository extends BaseRepository {
  async getActorsForMovie(movieId) {
    return mainSession.run(`MATCH (a:${this.name})-[:ACTS_IN]->(m:Movie) WHERE ID(m)=${movieId} return a`, { cacheKey: this.name });
  }

  async getActorsWithoutImage() {
    return mainSession.run(`MATCH (a:${this.name}) where NOT EXISTS(a.imageUrl) return a`);
  }
}

module.exports = new ActorRepository('Actor', { cache: true, imageProperty: 'imageUrl', searchTermProp: 'name' });
