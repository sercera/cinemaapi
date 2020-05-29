/* eslint-disable no-restricted-syntax */
const express = require('express');

const router = express.Router();
const { MovieRepository } = require('../../database/repositories');
const { asyncMiddleware, imageUploadMiddleware, jwtAuthMiddleware } = require('../../middlewares');


router.post('/:movieId/like', jwtAuthMiddleware(), asyncMiddleware(likeMovie));
router.put('/like', jwtAuthMiddleware(), asyncMiddleware(likeMovies));

router.get('/', asyncMiddleware(getAllMovies));
router.get('/categories', jwtAuthMiddleware(), asyncMiddleware(getMoviesByLikedCategories));
router.get('/recommended', jwtAuthMiddleware(), asyncMiddleware(getRecomendedMovies));
router.get('/liked', asyncMiddleware(getLikedMovies));
router.post('/', imageUploadMiddleware('imageUrl'), asyncMiddleware(createMovie));
router.put('/:id', imageUploadMiddleware('imageUrl'), asyncMiddleware(updateMovie));
router.get('/:id', asyncMiddleware(getMovieById));
router.delete('/:id', asyncMiddleware(deleteMovie));
router.get('/categories/:categoryId', asyncMiddleware(getMoviesByCategory));


async function getAllMovies(req, res) {
  const { skip, limit, sort } = req.query;
  const movies = await MovieRepository.getAll({ limit, skip, sort });
  return res.json(movies);
}

async function getMoviesByCategory(req, res) {
  const { categoryId } = req.params;
  const movies = await MovieRepository.getByCategory(categoryId);
  return res.json(movies);
}

async function getMoviesByLikedCategories(req, res) {
  const { id: userId } = req.user;
  const movies = await MovieRepository.getByLikedCategories(userId);
  const allMovies = [];
  for (const movie of movies) {
    allMovies.push(movie.movie);
  }
  if (allMovies.length < 10) {
    const randomMovies = await MovieRepository.getAll({ limit: 20 });
    for (const movie of randomMovies) {
      if (allMovies.filter((e) => e.id === movie.id).length === 0) {
        allMovies.push(movie);
      }
    }
  }
  return res.json(allMovies);
}

async function getLikedMovies(req, res) {
  const { id: userId } = req.user;
  const movies = await MovieRepository.getLikedMovies(userId);
  return res.json(movies);
}

async function getMovieById(req, res) {
  const { id } = req.params;
  const movie = await MovieRepository.getById(id);
  return res.json(movie);
}

async function createMovie(req, res) {
  const movie = await MovieRepository.create(req.body);
  return res.json(movie);
}

async function updateMovie(req, res) {
  const { id } = req.params;
  const updatedMovie = await MovieRepository.update(id, req.body);
  return res.json(updatedMovie);
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

async function likeMovies(req, res) {
  const { body: { userId }, body: { movieIds } } = req;
  await MovieRepository.likeMovies(userId, movieIds);
  return res.json({ message: 'Movies liked' });
}

async function getRecomendedMovies(req, res) {
  const { id } = req.user;
  const movies = await MovieRepository.getRecomended(id);
  return res.json(movies);
}


module.exports = router;
