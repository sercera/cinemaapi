const express = require('express');

const router = express.Router();
const UserRepository = require('../database/repositories/user');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.post('/register', asyncMiddleware(register));
router.post('/login', asyncMiddleware(login));

async function register(req, res) {
  const { username, password } = req.body;
  let response;
  try {
    response = await UserRepository.register(username, password);
  } catch (e) {}
  if (response.status === 400) {
    return res.status(400).json({ error: response.username });
  }
  return res.json({ user: response });
}

async function login(req, res) {
  const { username, password } = req.body;
  let response;
  try {
    response = await UserRepository.login(username, password);
  } catch (e) {}
  if (response.status === 400) {
    return res.status(400).json({ error: response.message });
  }
  return res.json({ token: response.token });
}

module.exports = router;
