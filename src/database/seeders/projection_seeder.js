
const moment = require('moment');
const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();

const { ProjectionRepository, CinemaRepository, MovieRepository } = require('../repositories');

(async () => {
  try {
    const movies = await MovieRepository.getAll();
    const cinemas = await CinemaRepository.getAll();
    let created = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const movie of movies) {
      for (let i = 0; i < cinemas.length; i++) {
        const createMany = Math.floor((Math.random() * 3) + 1);
        const projections = [];
        for (let createI = 0; createI < createMany; createI++) {
          const hallNumber = Math.floor(Math.random() * 10) + 1;
          const castTime = moment().add(Math.random() * 300, 'hour').format('YYYY-MM-DD HH:mm:ss');
          const seats = Math.floor(Math.random() * 50 + 50);
          const projectionBody = {
            hall: hallNumber, movieId: movie.id, name: movie.title, numberOfSeats: seats, seatsAvailable: seats, time: castTime,
          };
          projections.push(projectionBody);
        }
        created += projections.length;
        await Promise.all(projections.map((projection) => ProjectionRepository.createProjection(movie.id, cinemas[i].id, projection)));
      }
      console.log(`Created ${created} projections.`);
    }
  } catch (error) {
    console.log(error);
    return process.exit(1);
  }
  process.exit(0);
})();
