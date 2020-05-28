const express = require('express');

const router = express.Router();
const { UserRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllUsers));
router.get('/:id', asyncMiddleware(getUserById));
router.post('/manager', asyncMiddleware(createManager));
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

async function deleteUser(req, res) {
  const { id } = req.params;
  await UserRepository.deleteById(id);
  return res.json({ message: 'Deleted' });
}

module.exports = router;
