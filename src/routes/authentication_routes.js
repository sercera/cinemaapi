const express = require('express');

const router = express.Router();

const { sendEmail } = require('../services/email');
const { UserRepository, NotificationRepository } = require('../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../middlewares');

router.post('/register', imageUploadMiddleware('imageUrl'), asyncMiddleware(register));
router.post('/login', asyncMiddleware(login));

async function register(req, res) {
  let response;
  try {
    response = await UserRepository.register(req.body);
    const { user } = response;
    sendEmail(user.email, 'Uspesna registracija!',
      `Pozdrav ${user.username}, </br></br>
    Dragon nam je da si se prikljucio nasoj zajednici. </br>
    Nadam se da cemo se ludo zabaviti! </br>`);
    NotificationRepository.create(user.id, 'Dobrodosao na nasu aplikaciju!');
    NotificationRepository.create(user.id, 'Vise informacija o sebi mozete popuniti ovde!', `/user/${user.id}`);
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
