const parser = require('parse-neo4j');
const driver = require('../driver');

class ActorRepository {
  constructor() {
    this.session = driver.session();
  }

  getAll() {
    return this.session
      .run('MATCH (actor: Actor) return actor')
      .then(parser.parse);
  }

  getById(actorId) {
    return this.session
      .run(`MATCH (actor: Actor) WHERE ID(actor) = ${actorId} return actor`)
      .then(parser.parse);
  }

  delete(actorId) {
    return this.session
      .run(`MATCH (actor: Actor) WHERE ID(actor) = ${actorId} DETACH DELETE actor`);
  }

  create(name, lastname, country, birthYear) {
    return this.session
      .run(`CREATE
    (a: Actor {name : "${name}", lastname : "${lastname}", birthYear : "${birthYear}", country : "${country}"})
    return a`)
      .then(parser.parse);
  }
}
module.exports = new ActorRepository();
