const express = require('express');

const router = express.Router();
const UserRepository = require('../database/repositories/user');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/', asyncMiddleware(getAllUsers));
router.get('/:id', asyncMiddleware(getUserById));
router.get('/:id/movies', asyncMiddleware(getLikedMovies));

async function getAllUsers(req, res) {
  const users = await UserRepository.getAllUsers();
  return res.json({ users });
}

async function getUserById(req, res) {
  const { id } = req.params;
  console.log(id);
  const user = await UserRepository.getUser(id);
  return res.json({ user });
}

async function getLikedMovies(req, res) {
  const { id: userId } = req.params;
  const movies = await UserRepository.getLikedMovies(userId);
  return res.json({ movies });
}

module.exports = router;
