const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class CinemaRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (cinema: Cinema) return cinema', { cacheKey: this.name });
  }

  create(name, address, imageUrl) {
    return mainSession
      .runOne(`CREATE (c: Cinema {name: "${name}", address: "${address}", imageUrl:"${imageUrl}"}) return c`, { removeCacheKey: this.name });
  }


  delete(cinemaId) {
    return mainSession
      .run(`MATCH (c: Cinema) WHERE ID(c) = ${cinemaId}
    DETACH DELETE c`,
      { removeCacheKey: this.name });
  }
}

module.exports = new CinemaRepository('Cinema');
