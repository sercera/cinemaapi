const parser = require('parse-neo4j');
const driver = require('../driver');

class MovieRepository {
  constructor() {
    this.session = driver.session();
  }

  getAll() {
    return this.session
      .run('MATCH (m: Movie) return m')
      .then(parser.parse);
  }

  getById(movieId) {
    return this.session
      .run(`MATCH (m: Movie) WHERE ID(m) = ${movieId} RETURN m`)
      .then(parser.parse);
  }

  create(title, director, category) {
    return this.session
      .run(`MATCH (c: Category {name : "${category}"}) 
    CREATE (m: Movie {title : "${title}", director : "${director}"})-[r: BELONGS_TO]->(c) return m, r`)
      .then(parser.parse);
  }

  delete(movieId) {
    return this.session
      .run(`MATCH (m: Movie) WHERE ID(m) = ${movieId}
    DETACH DELETE m`)
      .then(parser.parse);
  }

  getByCategory(name) {
    return this.session
      .run(`MATCH (m)-[r: BELONGS_TO]->(c: Category {name : "${name}"}) return m`)
      .then(parser.parse);
  }

  getByActor(id) {
    return this.session
      .run(
        `MATCH (m)<-[r: ACTS_IN]-(a)  where ID(a)= ${id} return m`
      )
      .then(parser.parse);
  }

  addActorToMovie(actorId, movieId) {
    return this.session
      .run(`MATCH (a: Actor), (m: Movie) WHERE ID(a)=${actorId} AND ID(m)=${movieId} 
    CREATE (a)-[r: ACTS_IN]->(m) return r`)
      .then(parser.parse);
  }

  likeMovie(userId, movieId) {
    return this.session
      .run(`MATCH (u:User), (m:Movie) WHERE ID(u) = ${userId} AND ID(m) = ${movieId} CREATE (u)-[r:LIKES]->(m) return r`)
      .then(parser.parse);
  }
}

module.exports = new MovieRepository();
