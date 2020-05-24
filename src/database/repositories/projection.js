const parser = require('parse-neo4j');
const driver = require('../driver');

class ProjectionRepository {
  constructor() {
    this.session = driver.session();
  }

  getAllProjections() {
    return this.session
      .run('MATCH (projection: Projection) return projection')
      .then(parser.parse);
  }

  getAllCinemasForProjection(name) {
    return this.session
      .run(`MATCH (p {name : "${name}"})-[PLAYED_AT]->(c)
    return c`)
      .then(parser.parse);
  }

  getAllProjectionsForCinema(cinemaId) {
    return this.session
      .run(`MATCH (c)<-[r: PLAYED_AT]-(p) WHERE ID(c) = ${cinemaId}
    return p
    `)
      .then(parser.parse);
  }

  addProjection(cinemaId, name, time, hall, numberOfSeats, movieId) {
    return this.session
      .run(`MATCH (c: Cinema), (m: Movie) WHERE ID(c) = ${cinemaId} AND ID(m) = ${movieId} CREATE (p: Projection 
        {name : "${name}", time : "${time}", hall : "${hall}", numberOfSeats : "${numberOfSeats}"}) 
        CREATE (m)<-[r1: IS_STREAMING]-(p)-[r: PLAYED_AT]->(c) return r`)
      .then(parser.parse);
  }

  isStreaming(projectionId, movieId) {
    return this.session
      .run(`MATCH (p: Projection),(m: Movie) WHERE ID(p) = ${projectionId} AND ID(m) = ${movieId} CREATE (p)-[r: IS_STREAMING]->(m)
    return r`)
      .then(parser.parse);
  }

  deleteProjection(projectionId) {
    return this.session
      .run(`MATCH (p: Projection) WHERE ID(p) = ${projectionId}
    DETACH DELETE p`)
      .then(parser.parse);
  }

  checkReservation(seatNumber, projectionId) {
    return this.session
      .run(`MATCH (p: Projection) , (u: User)-[veza: MAKE_RESERVATION {seat : "${seatNumber}" }]->(p) WHERE ID(p) = ${projectionId} AND exists(veza.seat)
    return p
    `)
      .then(parser.parse);
  }

  makeReservation(userId, seatNumber, projectionId) {
    return this.session
      .run(`MATCH (p: Projection), (u: User) WHERE ID(p) = ${projectionId} AND ID(u) = ${userId} CREATE (u)-[r:MAKE_RESERVATION {seat: "${seatNumber}"}]->(p) return r`)
      .then(parser.parse);
  }

  cancelReservation(reservationId) {
    return this.session
      .run(`MATCH ()-[r: MAKE_RESERVATION]->() WHERE ID(r) = ${reservationId}
    DELETE r`)
      .then(parser.parse);
  }
}

module.exports = new ProjectionRepository();
