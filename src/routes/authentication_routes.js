const express = require('express');

const router = express.Router();
const { UserRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.post('/register', asyncMiddleware(register));
router.post('/login', asyncMiddleware(login));

async function register(req, res) {
  const { username, password } = req.body;
  let response;
  try {
    response = await UserRepository.register(username, password);
  } catch (e) {}
  return res.json(response);
}

async function login(req, res) {
  const { username, password } = req.body;
  let response;
  try {
    response = await UserRepository.login(username, password);
  } catch (e) {}
  return res.json(response);
}

module.exports = router;
