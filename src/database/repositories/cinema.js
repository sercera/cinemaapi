const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class CinemaRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (cinema: Cinema) return cinema', { cacheKey: this.name });
  }

  create(name, address) {
    return mainSession
      .run(`CREATE (c: Cinema {name: "${name}", address: "${address}"}) return c`, { removeCacheKey: this.name });
  }
}

module.exports = new CinemaRepository('Cinema');
