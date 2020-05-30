const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');

class CategoryRepository extends BaseRepository {
  getCustomKey(userId) {
    return `categories-liked-${userId}`;
  }

  async getLikedCategories(userId) {
    return mainSession.run(
      `MATCH (user:User)-[:LIKES]->(cat:${this.name}) WHERE ID(user) = ${userId}
    return cat`,
      { cacheKey: this.getCustomKey(userId) }
    );
  }

  async likeCategory(userId, categoryId) {
    return mainSession.runOne(
      `MATCH (cat: ${this.name}) WHERE ID(cat) = ${categoryId}
        MATCH (user:User) WHERE ID(user) = ${userId}
        MERGE (user)-[r:LIKES]->(cat)`,
      { removeCacheKey: this.getCustomKey(userId) }
    );
  }

  async likeCategories(userId, categoryIds) {
    return mainSession.runOne(
      `MATCH (user:User) WHERE ID(user) = ${userId}
        MATCH (cat: ${this.name}) WHERE ID(cat) IN ${this.stringify(
  categoryIds
)}
        MERGE (user)-[:LIKES]->(cat)
        WITH user
        MATCH (user)-[oldR:LIKES]->(oldCat:${this.name})
        WHERE NOT ID(oldCat) IN ${this.stringify(categoryIds)}
        DELETE oldR
        `,
      { removeCacheKey: this.getCustomKey(userId) }
    );
  }
}

module.exports = new CategoryRepository('Category', { cache: true });
