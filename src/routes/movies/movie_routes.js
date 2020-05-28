const express = require('express');

const router = express.Router();
const { MovieRepository } = require('../../database/repositories');
const { asyncMiddleware } = require('../../middlewares');

router.put('/:id', asyncMiddleware(updateMovie));

router.get('/', asyncMiddleware(getAllMovies));
router.get('/liked', asyncMiddleware(getLikedMovies));
router.post('/', asyncMiddleware(createMovie));
router.get('/:id', asyncMiddleware(getMovieById));
router.delete('/:id', asyncMiddleware(deleteMovie));
router.get('/categories/:name', asyncMiddleware(getMoviesByCategory));
router.get('/actors/:actorId', asyncMiddleware(getMoviesByActor));
router.post('/:movieId/actors/:actorId', asyncMiddleware(addActorToMovie));
router.post('/:movieId/like', asyncMiddleware(likeMovie));

async function getAllMovies(req, res) {
  const movies = await MovieRepository.getAll();
  return res.json({ movies });
}

async function updateMovie(req, res) {
  const { id } = req.params;
  const updatedMovie = await MovieRepository.update(id, req.body);
  return res.json({ updatedMovie });
}

async function getMovieById(req, res) {
  const { id } = req.params;
  const movie = await MovieRepository.getById(id);
  return res.json({ movie });
}

async function createMovie(req, res) {
  const { title, director, category } = req.body;
  try {
    await MovieRepository.create(title, director, category);
  } catch (e) {}
  return res.json({ message: 'Created' });
}

async function deleteMovie(req, res) {
  const { id } = req.params;
  try {
    await MovieRepository.delete(id);
  } catch (e) {}
  return res.json({ message: 'Deleted' });
}

async function getMoviesByCategory(req, res) {
  const { name } = req.params;
  const movies = await MovieRepository.getByCategory(name);
  return res.json({ movies });
}

async function getMoviesByActor(req, res) {
  const { actorId } = req.params;

  const movies = await MovieRepository.getByActor(actorId);
  return res.json({ movies });
}

async function addActorToMovie(req, res) {
  const { actorId, movieId } = req.params;
  await MovieRepository.addActorToMovie(actorId, movieId);
  return res.json({ message: 'Success' });
}


async function getLikedMovies(req, res) {
  const { id: userId } = req.params;
  const movies = await MovieRepository.getLikedMovies(userId);
  return res.json({ movies });
}

async function likeMovie(req, res) {
  const { body: { userId }, params: { movieId } } = req;
  await MovieRepository.likeMovie(userId, movieId);
  return res.json({ message: 'Movie liked' });
}

module.exports = router;
