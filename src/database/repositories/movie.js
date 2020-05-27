const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class MovieRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (m: Movie) return m', { cacheKey: this.name });
  }

  getById(movieId) {
    return mainSession
      .run(`MATCH (m: Movie) WHERE ID(m) = ${movieId} RETURN m`, { cacheKey: this.name });
  }

  create(title, director, category) {
    return mainSession
      .run(`MATCH (c: Category {name : "${category}"}) 
    CREATE (m: Movie {title : "${title}", director : "${director}"})-[r: BELONGS_TO]->(c) return m, r`, { removeCacheKey: this.name });
  }

  delete(movieId) {
    return mainSession
      .run(`MATCH (m: Movie) WHERE ID(m) = ${movieId}
    DETACH DELETE m`, { removeCacheKey: this.name });
  }

  getByCategory(name) {
    return mainSession
      .run(`MATCH (m)-[r: BELONGS_TO]->(c: Category {name : "${name}"}) return m`, { cacheKey: this.name });
  }

  getByActor(id) {
    return mainSession
      .run(
        `MATCH (m)<-[r: ACTS_IN]-(a)  where ID(a)= ${id} return m`,
        { cacheKey: this.name }
      );
  }

  addActorToMovie(actorId, movieId) {
    return mainSession
      .run(`MATCH (a: Actor), (m: Movie) WHERE ID(a)=${actorId} AND ID(m)=${movieId} 
    CREATE (a)-[r: ACTS_IN]->(m) return r`,
      { removeCacheKey: this.name });
  }

  likeMovie(userId, movieId) {
    return mainSession
      .run(`MATCH (u:User), (m:Movie) WHERE ID(u) = ${userId} AND ID(m) = ${movieId} CREATE (u)-[r:LIKES]->(m) return r`,
        { removeCacheKey: this.name });
  }


  getLikedMovies(userId) {
    return mainSession
      .run(`MATCH (u: User), (m)<-[r: LIKES]-(u) WHERE ID(u) = ${userId} return m`, { cacheKey: this.name });
  }
}

module.exports = new MovieRepository('Movie');
