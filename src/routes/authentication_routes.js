const express = require('express');

const router = express.Router();
const { UserRepository } = require('../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../middlewares');

router.post('/register', imageUploadMiddleware('imageUrl'), asyncMiddleware(register));
router.post('/login', asyncMiddleware(login));

async function register(req, res) {
  let response;
  try {
    response = await UserRepository.register(req.body);
  } catch (e) {
    return res.status(409).json({
      message: e.message,
    });
  }
  return res.json(response);
}

async function login(req, res) {
  const { username, password } = req.body;
  let response;
  try {
    response = await UserRepository.login(username, password);
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    });
  }
  return res.json(response);
}

module.exports = router;
