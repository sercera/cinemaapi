const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class ActorRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (actor: Actor) return actor', { cacheKey: this.name });
  }

  getById(actorId) {
    return mainSession
      .run(`MATCH (actor: Actor) WHERE ID(actor) = ${actorId} return actor`, { cacheKey: this.name });
  }

  delete(actorId) {
    return mainSession
      .run(`MATCH (actor: Actor) WHERE ID(actor) = ${actorId} DETACH DELETE actor`, { removeCacheKey: this.name });
  }

  create(name, lastname, country, birthYear) {
    return mainSession
      .run(`CREATE
    (a: Actor {name : "${name}", lastname : "${lastname}", birthYear : "${birthYear}", country : "${country}"})
    return a`, { removeCacheKey: this.name });
  }
}
module.exports = new ActorRepository('Actor');
