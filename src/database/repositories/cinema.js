const parser = require('parse-neo4j');
const driver = require('../driver');

class CinemaRepository {
  constructor() {
    this.session = driver.session();
  }

  getAllCinemas() {
    return this.session
      .run('MATCH (cinema: Cinema) return cinema')
      .then(parser.parse);
  }

  createCinema(name, address) {
    return this.session
      .run(`CREATE (c: Cinema {name: "${name}", address: "${address}"}) return c`)
      .then(parser.parse);
  }
}

module.exports = new CinemaRepository();
