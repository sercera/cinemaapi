const axios = require('axios');
const queryString = require('query-string');

const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();

const { MovieRepository } = require('../repositories');

const { CATEGORIES_MAPPING } = require('../../constants/tmdb/category_mapping');
const {
  TMDB_API_URL, OMDB_API_URL, getTMDPImageUrl,
} = require('../../constants/urls');
const { TMDB_API_KEY, OMDB_API_KEY } = require('../../config/api_keys');


(async () => {
  try {
    let moviesCount = 0;
    const MOVIE_LIMIT = 100;
    let page = 1;
    while (moviesCount < MOVIE_LIMIT) {
      const { data: { results, page: currentPage } } = await axios.get(`${TMDB_API_URL}/3/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`);
      page = currentPage + 1;
      const movies = [];
      for (let i = 0; i < results.length; i++) {
        const {
          poster_path: imageUrl,
          genre_ids: categoryIds = [],
          title,
          overview: description,
        } = results[i];
        const movie = {
          title,
          description,
          categoryIds: categoryIds.map((category) => CATEGORIES_MAPPING[category]),
          imageUrl: getTMDPImageUrl(imageUrl),
        };
        const query = queryString.stringify({
          apikey: OMDB_API_KEY,
          t: title,
        });
        const {
          data: {
            Director, Actors, Poster, Error,
          },
        } = await axios.get(`${OMDB_API_URL}/?${query}`);
        if (!Error) {
          if (!movie.imageUrl) {
            movie.imageUrl = Poster;
          }
          movie.director = Director;
          movie.actorNames = Actors.split(', ');
        }

        movies.push(movie);
        moviesCount++;
        if (moviesCount >= MOVIE_LIMIT) {
          break;
        }
      }
      console.log(`Creating ${movies.length} movies.`);
      await Promise.all(movies.map((movie) => MovieRepository.createMovieWithActorNames(movie)));
      console.log(`Created ${moviesCount} movies.`);
    }
  } catch (error) {
    console.log(error);
    return process.exit(1);
  }
  process.exit(0);
})();
