const express = require('express');

const router = express.Router();
const { ProjectionRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAll));
router.delete('/:projectionId', asyncMiddleware(deleteProjection));

router.get('/cinemas', asyncMiddleware(getAllCinemasForProjection));
router.get('/cinemas/:cinemaId', asyncMiddleware(getAllProjectionsForCinema));
router.post('/cinemas/:cinemaId', asyncMiddleware(addProjection));

router.post('/:projectionId/reservations', asyncMiddleware(makeReservation));
router.get('/:projectionId/reservations', asyncMiddleware(checkReservation));
router.delete('/reservations/:reservationId', asyncMiddleware(cancelReservation));
router.get('/:id', asyncMiddleware(getById));


async function getAll(req, res) {
  const projections = await ProjectionRepository.getAll();
  return res.json({ projections });
}

async function getById(req, res) {
  const { id } = req.params;
  const projection = await ProjectionRepository.getById(id);
  return res.json(projection);
}

async function getAllCinemasForProjection(req, res) {
  const { name } = req.body;
  const cinemas = await ProjectionRepository.getAllCinemasForProjection(name);
  return res.json({ cinemas });
}

async function getAllProjectionsForCinema(req, res) {
  const { cinemaId } = req.params;
  const projections = await ProjectionRepository.getAllProjectionsForCinema(
    cinemaId
  );
  return res.json({ projections });
}

async function addProjection(req, res) {
  const {
    params: { cinemaId },
    body,
  } = req;
  const projection = await ProjectionRepository.addProjection(cinemaId, body);
  if (!projection) {
    return res.status(404).json({ message: 'Failed creating' });
  }
  return res.json(projection);
}

async function deleteProjection(req, res) {
  const { projectionId } = req.params;
  await ProjectionRepository.delete(projectionId);
  return res.json({ message: 'Deleted' });
}

async function makeReservation(req, res) {
  const { body: { userId, seatNumbers }, params: { projectionId } } = req;
  await ProjectionRepository.makeReservation(userId, seatNumbers, projectionId);
  return res.json({ message: 'Reservation was made' });
}

async function checkReservation(req, res) {
  const { params: { projectionId } } = req;
  const reservation = await ProjectionRepository.getResetvations(projectionId);
  return res.json({ reservation });
}

async function cancelReservation(req, res) {
  const { reservationId } = req.params;
  await ProjectionRepository.cancelReservation(reservationId);
  return res.json({ message: 'Reservation canceled' });
}

module.exports = router;
