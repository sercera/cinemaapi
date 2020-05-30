const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class MovieRepository extends BaseRepository {
  async getAllStreamingMovies() {
    return mainSession.runOne(`
    MATCH (m:Movie)<-[:IS_STREAMING]-()
    WITH m, rand() AS number ORDER BY number
    RETURN collect(distinct m)`);
  }

  async getAllWithActors(options = {}) {
    const getOptions = this.cacheGetOptions();
    return mainSession
      .run(`MATCH (m: ${this.name})<-[:ACTS_IN]-(a:Actor) return m as movie,collect(a) as actors`, { ...getOptions, ...options })
      .then((response) => response.map(({ movie, actors }) => ({ ...movie, actors })));
  }

  create(movie) {
    const { categoryIds, actorIds } = movie;
    delete movie.actorIds;
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
    delete movie.actorIds;
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
      MATCH (m)<-[oldAct:ACTS_IN]-(oldA)
      DELETE oldAct
      MERGE (m)<-[:ACTS_IN]-(a)` : ''}
      RETURN m`,
      { removeCacheKey: this.name }
    );
  }

  createMovieWithActorNames(movie) {
    const { categoryIds, actorNames } = movie;
    delete movie.actorNames;
    let actorQuery = '';
    if (actorNames) {
      actorQuery = actorNames.map((actorName, index) => {
        const actorRef = `a${index}`;
        return `WITH m
        MERGE (${actorRef}: Actor ${this.stringify({ name: actorName })})
        MERGE (m)<-[:ACTS_IN]-(${actorRef})`;
      }).join(' ');
    }

    return mainSession.runOne(
      `MERGE (m: Movie ${this.stringify(movie)})
       ${categoryIds ? `WITH m
       MATCH (c: Category) WHERE ID(c) IN ${this.stringify(categoryIds)}
       MERGE (m)-[:BELONGS_TO]->(c)` : ''}
       ${actorQuery}
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
      `MATCH (u:User), (m:Movie) WHERE ID(u) = ${userId} AND ID(m) = ${movieId} 
      MERGE (u)-[r:LIKES]->(m) return r`,
      { removeCacheKey: this.name }
    );
  }

  dislikeMovie(userId, movieId) {
    return mainSession.run(
      `MATCH (u:User)-[r:LIKES]->(m:Movie) WHERE ID(u)=${userId} AND ID(m)=${movieId} DETACH DELETE r`
    );
  }

  likeMovies(userId, movieIds) {
    return mainSession.run(
      `MATCH (u:User), (m:Movie) WHERE ID(u) = ${userId} AND ID(m) IN ${this.stringify(movieIds)} 
      MERGE (u)-[r:LIKES]->(m) return r`,
      { removeCacheKey: this.name }
    );
  }

  getLikedMovies(userId) {
    return mainSession.run(
      `MATCH (u: User), (m:Movie)<-[r: LIKES]-(u) WHERE ID(u) = ${userId} return m`,
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
    MATCH (u)-[:LIKES]->(c:Category)<-[:BELONGS_TO]-(m:Movie)<-[:IS_STREAMING]-()
    RETURN ID(m) AS id, m.categoryIds AS categories, m.title AS title, m.description as description, m.imageUrl AS imageUrl, count(*) AS occurence
    ORDER BY occurence DESC
    UNION
    MATCH (person: User) WHERE ID(person)= ${userId} MATCH (person)-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(m:Movie)<-[:IS_STREAMING]-()
    RETURN ID(m) AS id, m.categoryIds AS categories,m.title AS title, m.description as description,m.imageUrl AS imageUrl, count(*) AS occurence
    ORDER BY occurence DESC
    UNION
    MATCH (person: User) WHERE ID(person)= ${userId} MATCH (person)-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(wanted:Movie)<-[:LIKES]-(random2:User)-[:LIKES]->(m:Movie)<-[:IS_STREAMING]-()
    RETURN ID(m) AS id, m.categoryIds AS categories, m.title AS title,m.description as description, m.imageUrl AS imageUrl, count(*) AS occurence
    ORDER BY occurence DESC
    `, { cacheKey: `movie-recommend-${userId}`, customKey: 'getRecomended', cacheExp: 60 * 10 });
  }

  getRecomendedWithSearch(userId, searchTerm) {
    return mainSession.run(`MATCH (u: User) WHERE ID(u)= ${userId}
    MATCH (u)-[:LIKES]->(c:Category)<-[:BELONGS_TO]-(m:Movie)
    WHERE toLower(toString(m.title)) =~ '.*${searchTerm.toLowerCase()}.*'
    RETURN ID(m) AS id, m.categoryIds AS categories, m.title AS title, m.description as description, m.imageUrl AS imageUrl, count(*) AS occurence
    ORDER BY occurence DESC
    UNION
    MATCH (person: User) WHERE ID(person)= ${userId} MATCH (person)-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(m:Movie)
    WHERE toLower(toString(m.title)) =~ '.*${searchTerm.toLowerCase()}.*'
    RETURN ID(m) AS id, m.categoryIds AS categories,m.title AS title, m.description as description,m.imageUrl AS imageUrl, count(*) AS occurence
    ORDER BY occurence DESC
    UNION
    MATCH (person: User) WHERE ID(person)= ${userId} MATCH (person)-[:LIKES]->(movie:Movie)<-[:LIKES]-(radnom:User)-[:LIKES]->(wanted:Movie)<-[:LIKES]-(random2:User)-[:LIKES]->(m:Movie)
    WHERE toLower(toString(m.title)) =~ '.*${searchTerm.toLowerCase()}.*'
    RETURN ID(m) AS id, m.categoryIds AS categories, m.title AS title,m.description as description, m.imageUrl AS imageUrl, count(*) AS occurence
    ORDER BY occurence DESC
    `, { cacheKey: `movie-recommend-${userId}`, customKey: 'getRecomended', cacheExp: 60 * 10 });
  }
}

module.exports = new MovieRepository('Movie', {
  cache: true,
  imageProperty: 'imageUrl',
  searchTermProp: 'title',
});
