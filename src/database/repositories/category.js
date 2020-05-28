const { BaseRepository } = require('./base_repo');

class CategoryRepository extends BaseRepository {

}

module.exports = new CategoryRepository('Category', { cache: true });
