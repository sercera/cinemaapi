const express = require('express');

const router = express.Router();
const ProjectionRepository = require('../database/repositories/projection');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/', asyncMiddleware(getAll));
router.get('/cinemas', asyncMiddleware(getAllCinemasForProjection));
router.get('/cinema/:cinemaId', asyncMiddleware(getAllProjectionsForCinema));
router.post('/cinema/:cinemaId', asyncMiddleware(addProjection));
router.delete('/:projectionId', asyncMiddleware(deleteProjection));

async function getAll(req, res) {
  const projections = await ProjectionRepository.getAllProjections();
  return res.json({ projections });
}

async function getAllCinemasForProjection(req, res) {
  const { name } = req.body;
  const cinemas = await ProjectionRepository.getAllCinemasForProjection(name);
  return res.json({ cinemas });
}

async function getAllProjectionsForCinema(req, res) {
  const { cinemaId } = req.params;
  const projections = await ProjectionRepository.getAllProjectionsForCinema(cinemaId);
  return res.json({ projections });
}

async function addProjection(req, res) {
  const {
    params: { cinemaId }, body: {
      name, time, hall, numberOfSeats, movieId,
    },
  } = req;
  await ProjectionRepository.addProjection(cinemaId, name, time, hall, numberOfSeats, movieId);
  return res.json({ message: 'Projection added' });
}

async function deleteProjection(req, res) {
  const { projectionId } = req.params;
  await ProjectionRepository.deleteProjection(projectionId);
  return res.json({ message: 'Deleted' });
}

module.exports = router;
