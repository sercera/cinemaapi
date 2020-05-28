const express = require('express');

const router = express.Router();
const { CinemaRepository } = require('../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCinemas));
router.post('/', imageUploadMiddleware('imageUrl'), asyncMiddleware(createCinema));
router.delete('/:id', asyncMiddleware(deleteCinema));

async function getAllCinemas(req, res) {
  const cinemas = await CinemaRepository.getAll();
  return res.json({ cinemas });
}

async function createCinema(req, res) {
  const cinema = await CinemaRepository.create(req.body);
  return res.json({ cinema });
}

async function deleteCinema(req, res) {
  const { id } = req.params;
  const response = await CinemaRepository.deleteById(id);
  return res.json(response);
}

module.exports = router;
