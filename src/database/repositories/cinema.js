const { BaseRepository } = require('./base_repo');

class CinemaRepository extends BaseRepository {

}

module.exports = new CinemaRepository('Cinema', { cache: true, imageProperty: 'imageUrl' });
