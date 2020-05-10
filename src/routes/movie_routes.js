const express = require('express');

const router = express.Router();
const MovieRepository = require('../database/repositories/movie');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/', asyncMiddleware(getAllMovies));
router.get('/:id', asyncMiddleware(getMovieById));
router.get('/category/:name', asyncMiddleware(getMoviesByCategory));
router.post('/', asyncMiddleware(createMovie));
router.delete('/:id', asyncMiddleware(deleteMovie));

async function getAllMovies(req, res) {
  const movies = await MovieRepository.getAll();
  return res.json({ movies });
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

module.exports = router;
