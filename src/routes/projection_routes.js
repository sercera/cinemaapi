const express = require('express');

const router = express.Router();
const ProjectionRepository = require('../database/repositories/projection');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/', asyncMiddleware(getAll));
router.get('/cinemas', asyncMiddleware(getAllCinemasForProjection));
router.get('/cinema/:cinemaId', asyncMiddleware(getAllProjectionsForCinema));
router.post('/cinema/:cinemaId', asyncMiddleware(addProjection));
router.delete('/:projectionId', asyncMiddleware(deleteProjection));
router.post('/:projectionId/reservation', asyncMiddleware(makeReservation));
router.get('/:projectionId/reservation', asyncMiddleware(checkReservation));
router.delete('/reservation/:reservationId', asyncMiddleware(cancelReservation));


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

async function makeReservation(req, res) {
  const { body: { userId, seatNumber }, params: { projectionId } } = req;
  await ProjectionRepository.makeReservation(userId, seatNumber, projectionId);
  return res.json({ message: 'Reservation was made' });
}

async function checkReservation(req, res) {
  const { body: { seatNumber }, params: { projectionId } } = req;
  const reservation = await ProjectionRepository.checkReservation(seatNumber, projectionId);
  return res.json({ reservation });
}

async function cancelReservation(req, res) {
  const { reservationId } = req.params;
  await ProjectionRepository.cancelReservation(reservationId);
  return res.json({ message: 'Reservation canceled' });
}

module.exports = router;
