const express = require('express');

const router = express.Router();
const { CinemaRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/', asyncMiddleware(getAllCinemas));
router.post('/', asyncMiddleware(createCinema));

async function getAllCinemas(req, res) {
  const cinemas = await CinemaRepository.getAll();
  return res.json({ cinemas });
}

async function createCinema(req, res) {
  const { name, address } = req.body;
  await CinemaRepository.create(name, address);
  return res.json({ message: 'Created' });
}

module.exports = router;
