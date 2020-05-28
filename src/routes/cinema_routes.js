const express = require('express');

const router = express.Router();
const { CinemaRepository } = require('../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCinemas));
router.post('/', imageUploadMiddleware().single('image'), asyncMiddleware(createCinema));

async function getAllCinemas(req, res) {
  const cinemas = await CinemaRepository.getAll();
  return res.json({ cinemas });
}

async function createCinema(req, res) {
  const { body: { name, address }, file: { publicUrl } } = req;
  const cinema = await CinemaRepository.create(name, address, publicUrl);
  return res.json({ cinema });
}

module.exports = router;
