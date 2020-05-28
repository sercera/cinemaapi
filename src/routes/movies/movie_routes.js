const express = require('express');

const router = express.Router();
const { MovieRepository } = require('../../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../../middlewares');


router.get('/', asyncMiddleware(getAllMovies));
router.put('/:id', asyncMiddleware(updateMovie));
router.get('/liked', asyncMiddleware(getLikedMovies));
router.post('/', imageUploadMiddleware('imageUrl'), asyncMiddleware(createMovie));
router.get('/:id', asyncMiddleware(getMovieById));
router.delete('/:id', asyncMiddleware(deleteMovie));
router.get('/categories/:categoryId', asyncMiddleware(getMoviesByCategory));
router.post('/:movieId/like', asyncMiddleware(likeMovie));

async function updateMovie(req, res) {
  const { id } = req.params;
  const updatedMovie = await MovieRepository.update(id, req.body);
  return res.json({ updatedMovie });
}

async function getAllMovies(req, res) {
  const movies = await MovieRepository.getAll();
  return res.json({ movies });
}

async function getMoviesByCategory(req, res) {
  const { categoryId } = req.params;
  const movies = await MovieRepository.getByCategory(categoryId);
  return res.json({ movies });
}

async function getLikedMovies(req, res) {
  const { id: userId } = req.params;
  const movies = await MovieRepository.getLikedMovies(userId);
  return res.json({ movies });
}

async function getMovieById(req, res) {
  const { id } = req.params;
  const movie = await MovieRepository.getById(id);
  return res.json({ movie });
}

async function createMovie(req, res) {
  const movie = await MovieRepository.create(req.body);
  return res.json({ movie });
}

async function deleteMovie(req, res) {
  const { id } = req.params;
  const response = await MovieRepository.deleteById(id);
  return res.json(response);
}


async function likeMovie(req, res) {
  const { body: { userId }, params: { movieId } } = req;
  await MovieRepository.likeMovie(userId, movieId);
  return res.json({ message: 'Movie liked' });
}

module.exports = router;
