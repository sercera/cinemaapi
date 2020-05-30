const { TMDB_API_KEY, OMDB_API_KEY } = process.env;


if (!TMDB_API_KEY) {
  console.warn('TMDB api key missing');
}

if (!OMDB_API_KEY) {
  console.warn('OMDB api key missing');
}

module.exports = {
  TMDB_API_KEY,
  OMDB_API_KEY,
};
