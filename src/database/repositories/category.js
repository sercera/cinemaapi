const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');


class CategoryRepository extends BaseRepository {
  async likeCategory(userId, categoryId) {
    const getOptions = this.cacheGetOptions();
    return mainSession
      .runOne(
        `MATCH (cat: ${this.name}) WHERE ID(cat) = ${categoryId}
        MATCH (user:User) WHERE ID(user) = ${userId}
        CREATE (user)-[r:LOVES]->(cat)`,
        getOptions
      );
  }
}

module.exports = new CategoryRepository('Category', { cache: true });
