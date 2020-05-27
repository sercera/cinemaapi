const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');


class CommentRepository extends BaseRepository {
  getCustomKey(movieId) {
    return `movie-comment-${movieId}`;
  }

  getAllCommentsForMovie(movieId) {
    return mainSession
      .run(`MATCH (m: Movie)<-[r: POSTED_ON]-(c: Comment) WHERE ID(m) = ${movieId} return c`, { cacheKey: this.name, customKey: this.getCustomKey(movieId) });
  }

  postComment(text, movieId, userId) {
    return mainSession
      .run(`MATCH (m: Movie), (u: User) WHERE ID(m) = ${movieId} AND ID(u) = ${userId} 
    CREATE (u)-[r1: WROTE]->(c: Comment {text : "${text}"})-[r: POSTED_ON]->(m) return r1,r`,
      { removeCacheKey: this.name, customKey: this.getCustomKey(movieId) });
  }

  delete(movieId, commentId) {
    return mainSession
      .run(`MATCH (c: Comment) WHERE ID(c) = ${commentId}
    DETACH DELETE c`,
      { removeCacheKey: this.name, customKey: this.getCustomKey(movieId) });
  }
}

module.exports = new CommentRepository('Comment');
