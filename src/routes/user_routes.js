const express = require('express');

const router = express.Router();
const { UserRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllUsers));
router.get('/:id', asyncMiddleware(getUserById));

async function getAllUsers(req, res) {
  const users = await UserRepository.getAll();
  return res.json({ users });
}

async function getUserById(req, res) {
  const { id } = req.params;
  const user = await UserRepository.getById(id);
  return res.json({ user });
}

module.exports = router;
