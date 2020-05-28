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


async function getAll(req, res) {
  const projections = await ProjectionRepository.getAll();
  const formatedProjections = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const proj of projections) {
    let obj = {};
    obj = proj.projection;
    obj.movie = proj.movie;
    formatedProjections.push(obj);
  }
  return res.json({ projections: formatedProjections });
}

async function getAllCinemasForProjection(req, res) {
  const { name } = req.body;
  const cinemas = await ProjectionRepository.getAllCinemasForProjection(name);
  return res.json({ cinemas });
}

async function getAllProjectionsForCinema(req, res) {
  const { cinemaId } = req.params;
  const projections = await ProjectionRepository.getAllProjectionsForCinema(cinemaId);
  const formatedProjections = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const proj of projections) {
    let obj = {};
    obj = proj.projection;
    obj.movie = proj.movie;
    formatedProjections.push(obj);
  }
  return res.json({ projections: formatedProjections });
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
  await ProjectionRepository.delete(projectionId);
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
