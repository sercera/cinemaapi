const express = require('express');

const router = express.Router();
const { CinemaRepository } = require('../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCinemas));
router.post('/', imageUploadMiddleware('imageUrl'), asyncMiddleware(createCinema));
router.put('/:id', imageUploadMiddleware('imageUrl'), asyncMiddleware(updateCinema));
router.delete('/:id', asyncMiddleware(deleteCinema));

async function getAllCinemas(req, res) {
  const { limit, skip, sort } = req.query;
  const cinemas = await CinemaRepository.getAll({ limit, skip, sort });
  return res.json({ cinemas });
}

async function createCinema(req, res) {
  const cinema = await CinemaRepository.create(req.body);
  return res.json({ cinema });
}

async function updateCinema(req, res) {
  const { id } = req.params;
  const cinema = await CinemaRepository.update(id, req.body);
  return res.json({ cinema });
}

async function deleteCinema(req, res) {
  const { id } = req.params;
  const response = await CinemaRepository.deleteById(id);
  return res.json(response);
}

module.exports = router;
