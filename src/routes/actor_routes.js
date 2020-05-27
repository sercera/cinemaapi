const express = require('express');

const router = express.Router();
const { ActorRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/', asyncMiddleware(getAll));
router.post('/', asyncMiddleware(createActor));
router.get('/:actorId', asyncMiddleware(getById));
router.delete('/:actorId', asyncMiddleware(deleteActor));

async function getAll(req, res) {
  const actors = await ActorRepository.getAll();
  return res.json({ actors });
}

async function getById(req, res) {
  const { actorId } = req.params;
  console.log(actorId);
  const actor = await ActorRepository.getById(actorId);
  return res.json({ actor });
}

async function createActor(req, res) {
  const {
    name, lastname = '', country = '', birthYear = '',
  } = req.body;
  await ActorRepository.create(name, lastname, country, birthYear);
  return res.json({ message: 'Actor created!' });
}

async function deleteActor(req, res) {
  const { actorId } = req.params;
  await ActorRepository.delete(actorId);
  return res.json({ message: 'Deleted' });
}

module.exports = router;
