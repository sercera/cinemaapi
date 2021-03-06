const express = require('express');

const router = express.Router();

const { USER_ROLES } = require('../constants/user_roles');
const { sendEmail } = require('../services/email');
const {
  ProjectionRepository,
  ActorRepository,
  CommentRepository,
  MovieRepository,
  NotificationRepository,
} = require('../database/repositories');
const { asyncMiddleware, roleAuthMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAll));
router.delete(
  '/:projectionId/reservations',
  asyncMiddleware(cancelReservation)
);
router.delete(
  '/:projectionId',
  roleAuthMiddleware(USER_ROLES.MANAGER),
  asyncMiddleware(deleteProjection)
);

router.get('/cinemas', asyncMiddleware(getAllCinemasForProjection));
router.get('/cinemas/:cinemaId', asyncMiddleware(getAllProjectionsForCinema));
router.post(
  '/cinemas/:cinemaId',
  roleAuthMiddleware(USER_ROLES.MANAGER),
  asyncMiddleware(addProjection)
);

router.get('/movies/:movieId', asyncMiddleware(getProjectionsForMovie));

router.post('/:projectionId/reservations', asyncMiddleware(makeReservation));
router.get('/:projectionId/reservations', asyncMiddleware(checkReservation));
router.get('/reservations', asyncMiddleware(getMyReservation));
router.get('/:id', asyncMiddleware(getById));

async function getAll(req, res) {
  const projections = await ProjectionRepository.getAll();
  return res.json({ projections });
}

async function getById(req, res) {
  const { id } = req.params;
  const { id: userId } = req.user;
  const projection = await ProjectionRepository.getById(id);
  const actors = await ActorRepository.getActorsForMovie(projection.movie.id);
  const comments = await CommentRepository.getAllCommentsForMovie(
    projection.movie.id
  );
  const likes = await MovieRepository.getNumberOfLikes(projection.movie.id);
  const liked = await MovieRepository.checkIfUserLikedMovie(
    projection.movie.id,
    userId
  );
  const reservation = await ProjectionRepository.getReservationsForUserAndProjection(
    userId,
    projection.id
  );
  let seats = [];
  if (reservation) {
    // eslint-disable-next-line prefer-destructuring
    seats = reservation.seats;
  }
  projection.movie.actors = actors;
  const formatedComments = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const comment of comments) {
    let obj = {};
    obj = comment.comment;
    obj.user = {
      id: comment.user.id,
      username: comment.user.username,
      imageUrl: comment.user.imageUrl,
    };
    formatedComments.push(obj);
  }
  projection.mySeats = seats;
  projection.movie.comments = formatedComments;
  projection.movie.likes = likes[0];
  if (liked) {
    projection.movie.liked = true;
  } else {
    projection.movie.liekd = false;
  }
  return res.json(projection);
}

async function getProjectionsForMovie(req, res) {
  const { movieId } = req.params;
  const dataArray = await ProjectionRepository.getAllProjectionsForMovie(
    movieId
  );
  const allProjections = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const data of dataArray) {
    const obj = data.projection;
    obj.movie = data.movie;
    obj.cinema = data.cinema;
    allProjections.push(obj);
  }
  return res.json(allProjections);
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
  const {
    user: { id: userId },
    body: { seatNumbers },
    params: { projectionId },
  } = req;
  const { seatsTaken = [], movie, cinema } = await ProjectionRepository.getById(
    projectionId
  );
  let seatTaken = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const seat of seatNumbers) {
    if (seatsTaken.includes(seat)) {
      seatTaken = true;
    }
  }
  if (seatTaken) {
    return res.json({ message: 'Seat taken' });
  }
  const totalSeatsTaken = seatsTaken.concat(seatNumbers);
  const reservation = await ProjectionRepository.makeReservation(
    userId,
    seatNumbers,
    totalSeatsTaken,
    projectionId
  );

  sendEmail(
    req.user.email,
    'Uspesna rezervacija!',
    `<html><body>Pozdrav, </br></br>
  Uspesno ste rezervisali film "${movie.title}" u bioskopu "${
  cinema.name
}" </br></br>
  Rezervisali ste mesta: ${seatNumbers.join(', ')}.</br></br>
  Vidimo se!</body></html>`
  );
  NotificationRepository.create(userId, `Uspesna rezervacija za ${movie.title}!`, `/projections/${projectionId}`);
  return res.json(reservation);
}

async function checkReservation(req, res) {
  const {
    params: { projectionId },
  } = req;
  const reservation = await ProjectionRepository.getReservationsForProjection(
    projectionId
  );
  return res.json({ reservation });
}

async function getMyReservation(req, res) {
  const { id: userId } = req.user;
  const reservation = await ProjectionRepository.getReservationsForUser(userId);
  return res.json(reservation);
}

async function cancelReservation(req, res) {
  const { id: userId } = req.user;
  const { projectionId } = req.params;
  const {
    id: reservationId,
  } = await ProjectionRepository.getReservationsForUserAndProjection(
    userId,
    projectionId
  );
  // eslint-disable-next-line prefer-const
  let { seatsTaken } = await ProjectionRepository.getProjectionForReservation(
    reservationId
  );
  const { seats } = await ProjectionRepository.getReservationById(
    reservationId
  );
  // eslint-disable-next-line no-restricted-syntax
  for (const seat of seats) {
    const index = seatsTaken.indexOf(seat);
    if (index > -1) {
      seatsTaken.splice(index, 1);
    }
  }
  await ProjectionRepository.cancelReservation(reservationId, seatsTaken);

  NotificationRepository.create(userId, 'Uspesno otkazana rezervacija!', `/projections/${projectionId}`);
  return res.json({ message: 'Reservation canceled' });
}

module.exports = router;
