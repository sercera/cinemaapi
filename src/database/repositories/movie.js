const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class MovieRepository extends BaseRepository {
  create(movie) {
    const { categoryIds, actorIds } = movie;
    return mainSession.runOne(
      `CREATE (m: Movie ${this.stringify(movie)})
       ${categoryIds ? `WITH m
       MATCH (c: Category) WHERE ID(c) IN ${this.stringify(categoryIds)}
       MERGE (m)-[:BELONGS_TO]->(c)` : ''}
       ${actorIds ? `WITH m
       MATCH (a: Actor) WHERE ID(a) IN ${this.stringify(actorIds)}
       MERGE (m)<-[: ACTS_IN]-(a)` : ''}
       RETURN m`,
      { removeCacheKey: this.name }
    );
  }

  async update(id, movie) {
    const { categoryIds, actorIds } = movie;
    return mainSession.runOne(
      `MATCH (m: ${this.name}) WHERE ID(m) = ${id} 
      SET m += ${this.stringify(movie)}
      ${categoryIds ? `WITH m
      MATCH (c: Category) WHERE ID(c) IN ${this.stringify(categoryIds)} 
      MATCH (m)-[oldBel:BELONGS_TO]->(oldC)
      DELETE oldBel
      MERGE (m)-[:BELONGS_TO]->(c)` : ''}
      ${actorIds ? `WITH m
      MATCH (a: Actor) WHERE ID(a) IN ${this.stringify(actorIds)}
      MATCH (m)<-[oldAct: ACTS_IN]-(oldA)
      DELETE oldAct
      MERGE (m)<-[: ACTS_IN]-(a)` : ''}
      RETURN m`,
      { removeCacheKey: this.name }
    );
  }

  getByCategory(id) {
    return mainSession.run(
      `MATCH (m)-[r: BELONGS_TO]->(c: Category)
      WHERE ID(c) = ${id} RETURN m`,
      { cacheKey: this.name }
    );
  }

  getByLikedCategories(userId) {
    return mainSession.run(
      `MATCH (movie)-[r:BELONGS_TO]->(c: Category)<-[:LIKES]-(u:User) WHERE ID(u)=${userId}
      RETURN movie, count(movie) AS occassions
      `
    );
  }

  getByActor(id) {
    return mainSession.run(
      `MATCH (m)<-[r: ACTS_IN]-(a: Actor)  where ID(a)= ${id} return m`,
      { cacheKey: this.name }
    );
  }

  addActorToMovie(actorId, movieId) {
    return mainSession.run(
      `MATCH (a: Actor), (m: Movie) WHERE ID(a)=${actorId} AND ID(m)=${movieId} 
    CREATE (a)-[r: ACTS_IN]->(m) return r`,
      { removeCacheKey: this.name }
    );
  }

  removeActorFromMovie(actorId, movieId) {
    return mainSession.run(
      `MATCH (a: Actor)-[r: ACTS_IN]->(m: Movie) WHERE ID(a)=${actorId} AND ID(m)=${movieId} 
    DELETE r`,
      { removeCacheKey: this.name }
    );
  }

  likeMovie(userId, movieId) {
    return mainSession.run(
      `MATCH (u:User), (m:Movie) WHERE ID(u) = ${userId} AND ID(m) = ${movieId} CREATE (u)-[r:LIKES]->(m) return r`,
      { removeCacheKey: this.name }
    );
  }

  getLikedMovies(userId) {
    return mainSession.run(
      `MATCH (u: User), (m)<-[r: LIKES]-(u) WHERE ID(u) = ${userId} return m`,
      { cacheKey: this.name }
    );
  }

  getNumberOfLikes(movieId) {
    return mainSession.run(
      `MATCH (u: User)-[r: LIKES]->(m:Movie) WHERE ID(m) = ${movieId}
      RETURN count(r) AS LIKES`
    );
  }

  checkIfUserLikedMovie(movieId, userId) {
    return mainSession.runOne(
      `MATCH (u:User), (m:Movie) WHERE ID(u)=${userId} AND ID(m)=${movieId}
      RETURN EXISTS( (u)-[:LIKES]-(m) )`
    );
  }

  getRecomended(userId) {
    return mainSession.run(`MATCH (u: User) WHERE ID(u)= ${userId}
    MATCH (u)-[:LOVES]->(c:Category)<-[:BELONGS_TO]-(m:Movie)<-[:IS_STREAMING]-()
    RETURN ID(m) AS id, m.categoryIds AS categories, m.title AS title, m.description as description, m.imageUrl AS image, count(*) AS occurence
    ORDER BY occurence DESC
    UNION
    MATCH (person: User) WHERE ID(person)= ${userId} MATCH (person)-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(m:Movie)<-[:IS_STREAMING]-()
    RETURN ID(m) AS id, m.categoryIds AS categories,m.title AS title, m.description as description,m.imageUrl AS image, count(*) AS occurence
    ORDER BY occurence DESC
    UNION
    MATCH (person: User) WHERE ID(person)= ${userId} MATCH (person)-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(wanted:Movie)<-[:LIKES]-(random2:User)-[:LIKES]->(m:Movie)<-[:IS_STREAMING]-()
    RETURN ID(m) AS id, m.categoryIds AS categories, m.title AS title,m.description as description, m.imageUrl AS image, count(*) AS occurence
    ORDER BY occurence DESC
    `);
  }
}

module.exports = new MovieRepository('Movie', {
  cache: true,
  imageProperty: 'imageUrl',
});
