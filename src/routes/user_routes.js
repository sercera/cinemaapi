const express = require('express');

const router = express.Router();
const { UserRepository } = require('../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../middlewares');


router.get('/managers', asyncMiddleware(getAllManagers));
router.get('/managers/:cinemaId', asyncMiddleware(getManagersByCinema));
router.post('/managers', imageUploadMiddleware('imageUrl'), asyncMiddleware(createManager));

router.get('/', asyncMiddleware(getAllUsers));
router.get('/:id', asyncMiddleware(getUserById));
router.put('/:id', imageUploadMiddleware('imageUrl'), asyncMiddleware(updateUser));
router.delete('/:id', asyncMiddleware(deleteUser));


async function getAllUsers(req, res) {
  const users = await UserRepository.getAll();
  return res.json(users);
}

async function getAllManagers(req, res) {
  const users = await UserRepository.getAllManagers();
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
