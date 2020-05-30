const axios = require('axios');
const queryString = require('query-string');

const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();

const { ActorRepository } = require('../repositories');

const { TMDB_API_URL, getTMDPImageUrl } = require('../../constants/urls');
const { TMDB_API_KEY } = require('../../config/api_keys');

(async () => {
  try {
    const actors = await ActorRepository.getActorsWithoutImage();
    for (let i = 0; i < actors.length; i++) {
      const actor = actors[i];
      const query = queryString.stringify({
        api_key: TMDB_API_KEY,
        query: actor.name,
      });
      const {
        data: { results },
      } = await axios.get(`${TMDB_API_URL}/3/search/person?${query}`);
      if (results.length) {
        const [{ profile_path: profilePath }] = results;
        const imageUrl = getTMDPImageUrl(profilePath);
        if (imageUrl) {
          await ActorRepository.update(actor.id, { imageUrl });
        }
        console.log(`${actor.name} is found and updated!`);
      }
    }
  } catch (error) {
    console.log(error);
    return process.exit(1);
  }
  process.exit(0);
})();
