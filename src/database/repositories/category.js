const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');

class CategoryRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (c: Category) return c', { cacheKey: this.name });
  }

  create(name) {
    return mainSession
      .run(`CREATE (c: Category {name: "${name}"}) return c`, { removeCacheKey: this.name });
  }
}

module.exports = new CategoryRepository('Category');
