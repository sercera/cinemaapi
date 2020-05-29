const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');


class ProjectionRepository extends BaseRepository {
  async getAll() {
    const projections = await mainSession
      .run('MATCH (cinema:Cinema)<-[:PLAYED_AT]-(projection: Projection)-[:IS_STREAMING]->(movie:Movie) return projection,movie,cinema ORDER BY projection.time', { cacheKey: this.name });
    const formatedProjections = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const proj of projections) {
      let obj = {};
      obj = proj.projection;
      obj.movie = proj.movie;
      obj.cinema = proj.cinema;
      formatedProjections.push(obj);
    }
    return formatedProjections;
  }

  async getById(projectionId) {
    const response = await mainSession.runOne(`MATCH (projection:Projection)-[:IS_STREAMING]->(movie:Movie) WHERE ID(projection)=${projectionId} return projection, movie`);
    const { projection } = response;
    projection.movie = response.movie;
    return projection;
  }

  getAllCinemasForProjection(name) {
    return mainSession
      .run(`MATCH (p {name : "${name}"})-[PLAYED_AT]->(c)
    return c`,
      { cacheKey: this.name });
  }

  async getAllProjectionsForCinema(cinemaId) {
    const projections = await mainSession
      .run(`MATCH (c)<-[r: PLAYED_AT]-(projection)-[:IS_STREAMING]->(movie:Movie) WHERE ID(c) = ${cinemaId}
    return projection, movie
    `,
      { cacheKey: this.name });
    const formatedProjections = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const proj of projections) {
      let obj = {};
      obj = proj.projection;
      obj.movie = proj.movie;
      formatedProjections.push(obj);
    }
    return formatedProjections;
  }

  addProjection(cinemaId, projection) {
    const { movieId } = projection;
    return mainSession
      .run(`MATCH (c: Cinema), (m: Movie) WHERE ID(c) = ${cinemaId} AND ID(m) = ${movieId} 
        CREATE (p: Projection ${this.stringify(projection)}) 
        CREATE (m)<-[r1: IS_STREAMING]-(p)-[r: PLAYED_AT]->(c) return r`,
      { removeCacheKey: this.name });
  }

  isStreaming(projectionId, movieId) {
    return mainSession
      .run(`MATCH (p: Projection),(m: Movie) WHERE ID(p) = ${projectionId} AND ID(m) = ${movieId} CREATE (p)-[r: IS_STREAMING]->(m)
    return r`,
      { cacheKey: this.name });
  }

  delete(projectionId) {
    return mainSession
      .run(`MATCH (p: Projection) WHERE ID(p) = ${projectionId}
    DETACH DELETE p`, { removeCacheKey: this.name });
  }

  makeReservation(userId, seatNumbers, projectionId) {
    const seatsCount = seatNumbers.length;
    return mainSession
      .run(`MATCH (p: Projection), (u: User) WHERE ID(p) = ${projectionId} AND ID(u) = ${userId} CREATE (u)-[r:MAKE_RESERVATION {seats: "${seatNumbers}"}]->(p)
      SET p += { seatsAvailable: TOINT(p.seatsAvailable)-${seatsCount} }
       return r`);
  }

  getResetvations(projectionId) {
    return mainSession
      .run(`MATCH (p: Projection) , (u: User)-[link: MAKE_RESERVATION]->(p) WHERE ID(p) = ${projectionId} AND exists(link.seats)
    return p
    `);
  }

  cancelReservation(reservationId) {
    return mainSession
      .run(`MATCH ()-[r: MAKE_RESERVATION]->(p) WHERE ID(r) = ${reservationId}
      SET p += { seatsAvailable: TOINT(p.seatsAvailable)+1 }
    DELETE r`);
  }
}

module.exports = new ProjectionRepository('Projection');
