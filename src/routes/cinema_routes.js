const express = require('express');

const router = express.Router();
const {
  CinemaRepository,
  ProjectionRepository,
} = require('../database/repositories');

const { USER_ROLES } = require('../constants/user_roles');
const { asyncMiddleware, imageUploadMiddleware, roleAuthMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCinemas));
router.get('/:id', asyncMiddleware(getCinema));
router.post(
  '/',
  roleAuthMiddleware(USER_ROLES.ADMIN),
  imageUploadMiddleware('imageUrl'),
  asyncMiddleware(createCinema)
);
router.put(
  '/:id',
  roleAuthMiddleware([USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  imageUploadMiddleware('imageUrl'),
  asyncMiddleware(updateCinema)
);
router.delete('/:id', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(deleteCinema));

async function getAllCinemas(req, res) {
  const { limit, skip, sort } = req.query;
  const cinemas = await CinemaRepository.getAll({ limit, skip, sort });
  return res.json(cinemas);
}

async function getCinema(req, res) {
  const { id } = req.params;
  const [cinema, projections] = await Promise.all([
    CinemaRepository.getById(id),
    ProjectionRepository.getAllProjectionsForCinema(id),
  ]);
  if (!cinema) {
    return res.status(404).json({ message: 'Not found!' });
  }
  cinema.projections = projections;
  return res.json(cinema);
}

async function createCinema(req, res) {
  const cinema = await CinemaRepository.create(req.body);
  return res.json(cinema);
}

async function updateCinema(req, res) {
  const { id } = req.params;
  const cinema = await CinemaRepository.update(id, req.body);
  return res.json(cinema);
}

async function deleteCinema(req, res) {
  const { id } = req.params;
  const response = await CinemaRepository.deleteById(id);
  return res.json(response);
}

module.exports = router;
