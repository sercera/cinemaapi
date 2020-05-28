const express = require('express');

const router = express.Router();
const { UserRepository } = require('../database/repositories');
const { hashString } = require('../common/hashing');
const { asyncMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllUsers));
router.get('/managers/:cinemaId', asyncMiddleware(getManagersByCinema));
router.get('/:id', asyncMiddleware(getUserById));
router.put('/:id', asyncMiddleware(updateUser));
router.post('/managers', asyncMiddleware(createManager));
router.delete('/:id', asyncMiddleware(deleteUser));

async function getAllUsers(req, res) {
  const users = await UserRepository.getAll();
  return res.json({ users });
}

async function getUserById(req, res) {
  const { id } = req.params;
  const user = await UserRepository.getById(id);
  return res.json({ user });
}

async function createManager(req, res) {
  const { username, password, cinemaId } = req.body;
  const manager = await UserRepository.createManager(username, password, cinemaId);
  return res.json({ manager });
}

async function updateUser(req, res) {
  const { params: { id }, body: { username, password, cinemaId } } = req;
  let hashPassword;
  if (password) {
    hashPassword = await hashString(password);
  }
  const user = await UserRepository.update(id, { username, password: hashPassword, cinemaId });
  return res.json(user);
}

async function getManagersByCinema(req, res) {
  const { cinemaId } = req.params;
  const managers = await UserRepository.getManagersByCinema(cinemaId);
  return res.json({ managers });
}

async function deleteUser(req, res) {
  const { id } = req.params;
  await UserRepository.deleteById(id);
  return res.json({ message: 'Deleted' });
}

module.exports = router;
