const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');


class ProjectionRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (projection: Projection) return projection', { cacheKey: this.name });
  }

  getAllCinemasForProjection(name) {
    return mainSession
      .run(`MATCH (p {name : "${name}"})-[PLAYED_AT]->(c)
    return c`,
      { cacheKey: this.name });
  }

  getAllProjectionsForCinema(cinemaId) {
    return mainSession
      .run(`MATCH (c)<-[r: PLAYED_AT]-(p) WHERE ID(c) = ${cinemaId}
    return p
    `,
      { cacheKey: this.name });
  }

  addProjection(cinemaId, name, time, hall, numberOfSeats, movieId) {
    return mainSession
      .run(`MATCH (c: Cinema), (m: Movie) WHERE ID(c) = ${cinemaId} AND ID(m) = ${movieId} CREATE (p: Projection 
        {name : "${name}", time : "${time}", hall : "${hall}", numberOfSeats : "${numberOfSeats}"}) 
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

  checkReservation(seatNumber, projectionId) {
    return mainSession
      .run(`MATCH (p: Projection) , (u: User)-[link: MAKE_RESERVATION {seat : "${seatNumber}" }]->(p) WHERE ID(p) = ${projectionId} AND exists(link.seat)
    return p
    `);
  }

  makeReservation(userId, seatNumber, projectionId) {
    return mainSession
      .run(`MATCH (p: Projection), (u: User) WHERE ID(p) = ${projectionId} AND ID(u) = ${userId} CREATE (u)-[r:MAKE_RESERVATION {seat: "${seatNumber}"}]->(p) return r`);
  }

  cancelReservation(reservationId) {
    return mainSession
      .run(`MATCH ()-[r: MAKE_RESERVATION]->() WHERE ID(r) = ${reservationId}
    DELETE r`);
  }
}

module.exports = new ProjectionRepository('Projection');
