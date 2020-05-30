const axios = require('axios');

const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();

const { ActorRepository } = require('../repositories');

const { TMDB_API_URL, getTMDPImageUrl } = require('../../constants/urls');
const { TMDB_API_KEY } = require('../../config/api_keys');

(async () => {
  try {
    let actorsCount = 0;
    const ACTOR_LIMIT = 500;
    let page = 1;
    while (actorsCount < ACTOR_LIMIT) {
      const { data: { results, page: currentPage } } = await axios.get(`${TMDB_API_URL}/3/person/popular?api_key=${TMDB_API_KEY}&page=${page}`);
      page = currentPage + 1;
      const actors = [];
      for (let i = 0; i < results.length; i++) {
        const person = results[i];
        if (person.known_for_department === 'Acting') {
          const actor = {
            name: person.name,
            imageUrl: getTMDPImageUrl(person.profile_path),
          };
          actors.push(actor);
          actorsCount++;
          if (actorsCount >= ACTOR_LIMIT) {
            break;
          }
        }
      }
      console.log(`Creating ${actors.length} actors`);
      await ActorRepository.createMany(actors);
      console.log(`Actors created: ${actorsCount}`);
    }
  } catch (error) {
    console.log(error);
    return process.exit(1);
  }
  process.exit(0);
})();
