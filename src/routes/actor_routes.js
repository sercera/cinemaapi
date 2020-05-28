const express = require('express');

const router = express.Router();
const { ActorRepository } = require('../database/repositories');
const { asyncMiddleware, imageUploadMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAll));
router.post('/', imageUploadMiddleware('imageUrl'), asyncMiddleware(createActor));
router.put('/:actorId', imageUploadMiddleware('imageUrl'), asyncMiddleware(updateActor));
router.get('/:actorId', asyncMiddleware(getById));
router.delete('/:actorId', asyncMiddleware(deleteActor));

async function getAll(req, res) {
  const { limit, skip, sort } = req.query;
  const actors = await ActorRepository.getAll({ limit, skip, sort });
  return res.json(actors);
}

async function getById(req, res) {
  const { actorId } = req.params;
  const actor = await ActorRepository.getById(actorId);
  return res.json(actor);
}

async function createActor(req, res) {
  console.log(req.body);
  const actor = await ActorRepository.create(req.body);
  return res.json(actor);
}

async function updateActor(req, res) {
  const { actorId } = req.params;
  const actor = await ActorRepository.update(actorId, req.body);
  return res.json(actor);
}


async function deleteActor(req, res) {
  const { actorId } = req.params;
  const response = await ActorRepository.deleteById(actorId);
  return res.json(response);
}

module.exports = router;
