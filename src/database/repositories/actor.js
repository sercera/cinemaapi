const { BaseRepository } = require('./base_repo');

class ActorRepository extends BaseRepository {

}

module.exports = new ActorRepository('Actor', { cache: true, imageProperty: 'imageUrl' });
