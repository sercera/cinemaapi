const parser = require('parse-neo4j');
const driver = require('../driver');

class CategoryRepository {
  constructor() {
    this.session = driver.session();
  }

  getAllCategories() {
    return this.session
      .run('MATCH (c: Category) return c')
      .then(parser.parse);
  }

  createCategory(name) {
    return this.session
      .run(`CREATE (c: Category {name: "${name}"}) return c`)
      .then(parser.parse);
  }
}

module.exports = new CategoryRepository();
