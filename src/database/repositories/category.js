const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');


class CategoryRepository extends BaseRepository {
  async likeCategory(userId, categoryId) {
    const options = this.cacheRemoveOptions();
    return mainSession
      .runOne(
        `MATCH (cat: ${this.name}) WHERE ID(cat) = ${categoryId}
        MATCH (user:User) WHERE ID(user) = ${userId}
        MERGE (user)-[r:LIKES]->(cat)`,
        options
      );
  }

  async likeCategories(userId, categoryIds) {
    const options = this.cacheRemoveOptions();
    return mainSession
      .runOne(
        `MATCH (user:User) WHERE ID(user) = ${userId}
        MATCH (cat: ${this.name}) WHERE ID(cat) IN ${this.stringify(categoryIds)}
        MERGE (user)-[:LIKES]->(cat)
        WITH user
        MATCH (user)-[oldR:LIKES]->(oldCat:${this.name})
        WHERE NOT ID(oldCat) IN ${this.stringify(categoryIds)}
        DELETE oldR
        `,
        options
      );
  }
}

module.exports = new CategoryRepository('Category', { cache: true });
