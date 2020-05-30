
const moment = require('moment');
const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();

const { ProjectionRepository, CinemaRepository, MovieRepository } = require('../repositories');

(async () => {
  try {
    const movies = await MovieRepository.getAll();
    const cinemas = await CinemaRepository.getAll();
    // eslint-disable-next-line no-restricted-syntax
    for (const movie of movies) {
      for (let i = 0; i < cinemas.length; i++) {
        const hallNumber = Math.floor(Math.random() * 6) + 1;
        const castTime = moment().add(Math.random() * 200, 'hour').format('YYYY-MM-DD HH:mm:ss');
        const projectionBody = {
          hall: hallNumber, movieId: movie.id, name: movie.title, numberOfSeats: 100, seatsAvailable: 100, time: castTime,
        };
        await ProjectionRepository.createProjection(movie.id, cinemas[i].id, projectionBody);
      }
    }
  } catch (error) {
    console.log(error);
    return process.exit(1);
  }
  process.exit(0);
})();
