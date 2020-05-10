const express = require('express');

const router = express.Router();
const UserRepository = require('../database/repositories/user');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/', asyncMiddleware(getAllUsers));
router.get('/:id', asyncMiddleware(getUserById));

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

module.exports = router;
