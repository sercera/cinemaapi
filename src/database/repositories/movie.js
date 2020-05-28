const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class MovieRepository extends BaseRepository {
  create(movie) {
    const { categoryIds, actorIds } = movie;
    delete movie.actorIds;
    return mainSession
      .runOne(`
       MATCH (c: Category) WHERE ID(c) IN ${this.stringify(categoryIds)} 
       MATCH (a: Actor) WHERE ID(a) IN ${this.stringify(actorIds)}
       MERGE (m: Movie ${this.stringify(movie)})
       MERGE (m)-[:BELONGS_TO]->(c)
       MERGE (m)<-[: ACTS_IN]-(a)
       RETURN m`, { removeCacheKey: this.name });
  }

  async update(id, movie) {
    const { categoryIds, actorIds } = movie;
    delete movie.actorIds;
    return mainSession
      .runOne(`MATCH (m: ${this.name}) WHERE ID(m) = ${id} 
      MATCH (c: Category) WHERE ID(c) IN ${this.stringify(categoryIds)} 
      MATCH (a: Actor) WHERE ID(a) IN ${this.stringify(actorIds)}
      MATCH (m)-[oldBel:BELONGS_TO]->(oldC)
      MATCH (m)<-[oldAct: ACTS_IN]-(oldA)
      SET m = ${this.stringify(movie)}
      DELETE oldBel
      DELETE oldAct
      MERGE (m)-[:BELONGS_TO]->(c)
      MERGE (m)<-[: ACTS_IN]-(a)
      RETURN m`, { removeCacheKey: this.name });
  }

  getByCategory(id) {
    return mainSession
      .run(`MATCH (m)-[r: BELONGS_TO]->(c: Category)
      WHERE ID(c) = ${id} RETURN m`, { cacheKey: this.name });
  }

  getByActor(id) {
    return mainSession
      .run(
        `MATCH (m)<-[r: ACTS_IN]-(a: Actor)  where ID(a)= ${id} return m`,
        { cacheKey: this.name }
      );
  }

  addActorToMovie(actorId, movieId) {
    return mainSession
      .run(`MATCH (a: Actor), (m: Movie) WHERE ID(a)=${actorId} AND ID(m)=${movieId} 
    CREATE (a)-[r: ACTS_IN]->(m) return r`,
      { removeCacheKey: this.name });
  }


  removeActorFromMovie(actorId, movieId) {
    return mainSession
      .run(`MATCH (a: Actor)-[r: ACTS_IN]->(m: Movie) WHERE ID(a)=${actorId} AND ID(m)=${movieId} 
    DELETE r`,
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

  getMoviesFromFavCategories(userId) {
    return mainSession
      .run(
        `MATCH (u: User) WHERE ID(u)= ${userId}
        MATCH (u)-[:LOVES]->(c:Category)<-[:BELONGS_TO]-(m:Movie)
        RETURN m, count(*) AS occurence
        ORDER BY occurence DESC
        LIMIT 5
        `,
        { cacheKey: this.name }
      );
  }

  getRecomendedMovies(userId) {
    return mainSession
      .run(
        `MATCH (person:User {id: ${userId}})-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(wanted:Movie)
        RETURN wanted, count(*) AS occurence
        ORDER BY occurence DESC
        LIMIT 5
        UNION
        MATCH (person:User {id: ${userId}})-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(wanted:Movie)<-[:LIKES]-(random2:User)-[:LIKES]->(wanted2:Movie)
        RETURN wanted2, count(*) AS occurence
        ORDER BY occurence DESC
        LIMIT 5
        `, { cacheKey: this.name }
      );
  }
}

module.exports = new MovieRepository('Movie', { cache: true, imageProperty: 'imageUrl' });
