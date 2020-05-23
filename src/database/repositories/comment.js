const parser = require('parse-neo4j');
const driver = require('../driver');

class CommentRepository {
  constructor() {
    this.session = driver.session();
  }

  getAllCommentsForMovie(movieId) {
    return this.session
      .run(`MATCH (m: Movie)<-[r: POSTED_ON]-(c) WHERE ID(m) = ${movieId} return c`)
      .then(parser.parse);
  }

  postComment(text, movieId, userId) {
    return this.session
      .run(`MATCH (m: Movie), (u: User) WHERE ID(m) = ${movieId} AND ID(u) = ${userId} 
    CREATE (u)-[r1: WROTE]->(c: Comment {text : "${text}"})-[r: POSTED_ON]->(m) return r1,r`)
      .then(parser.parse);
  }

  deleteComment(commentId) {
    return this.session
      .run(`MATCH (c: Comment) WHERE ID(c) = ${commentId}
    DETACH DELETE c`)
      .then(parser.parse);
  }
}

module.exports = new CommentRepository();
