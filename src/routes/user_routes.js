const express = require('express');

const router = express.Router();

const { USER_ROLES } = require('../constants/user_roles');
const { UserRepository } = require('../database/repositories');
const {
  asyncMiddleware, imageUploadMiddleware, roleAuthMiddleware,
} = require('../middlewares');


router.get('/managers', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(getAllManagers));
router.get('/managers/:cinemaId', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(getManagersByCinema));
router.post('/managers', roleAuthMiddleware(USER_ROLES.ADMIN), imageUploadMiddleware('imageUrl'), asyncMiddleware(createManager));

router.get('/', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(getAllUsers));
router.get('/current', asyncMiddleware(getCurrentUser));
router.get('/:id', asyncMiddleware(getUserById));
router.put('/:id', imageUploadMiddleware('imageUrl'), asyncMiddleware(updateUser));
router.delete('/:id', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(deleteUser));


async function getAllUsers(req, res) {
  const users = await UserRepository.getAll(req.query);
  return res.json(users);
}

async function getCurrentUser(req, res) {
  return res.json(req.user);
}

async function getAllManagers(req, res) {
  const users = await UserRepository.getAllManagers(req.query);
  return res.json(users);
}

async function getUserById(req, res) {
  const { id } = req.params;
  const user = await UserRepository.getById(id);
  return res.json(user);
}

async function createManager(req, res) {
  const manager = await UserRepository.createManager(req.body);
  return res.json(manager);
}

async function updateUser(req, res) {
  const { params: { id }, body } = req;
  const user = await UserRepository.update(id, body);
  return res.json(user);
}

async function deleteUser(req, res) {
  const { id } = req.params;
  await UserRepository.deleteById(id);
  return res.json({ message: 'Deleted' });
}

async function getManagersByCinema(req, res) {
  const { cinemaId } = req.params;
  const managers = await UserRepository.getManagersByCinema(cinemaId);
  return res.json(managers);
}

module.exports = router;
