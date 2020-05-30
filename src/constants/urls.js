const TMDB_IMAGES_URL = 'https://image.tmdb.org';
const TMDB_API_URL = 'http://api.themoviedb.org';
const OMDB_API_URL = 'http://www.omdbapi.com';

const getTMDPImageUrl = (image) => (image ? `${TMDB_IMAGES_URL}/t/p/w500${image}` : undefined);

module.exports = {
  TMDB_API_URL,
  OMDB_API_URL,
  TMDB_IMAGES_URL,
  getTMDPImageUrl,
};
