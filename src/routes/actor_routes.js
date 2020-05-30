const express = require('express');

const router = express.Router();
const { ActorRepository } = require('../database/repositories');

const { USER_ROLES } = require('../constants/user_roles');

const { asyncMiddleware, imageUploadMiddleware, roleAuthMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAll));
router.post('/', roleAuthMiddleware(USER_ROLES.ADMIN), imageUploadMiddleware('imageUrl'), asyncMiddleware(createActor));
router.put('/:actorId', roleAuthMiddleware(USER_ROLES.ADMIN), imageUploadMiddleware('imageUrl'), asyncMiddleware(updateActor));
router.get('/:actorId', asyncMiddleware(getById));
router.delete('/:actorId', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(deleteActor));

async function getAll(req, res) {
  const actors = await ActorRepository.getPaginated(req.query);
  return res.json(actors);
}

async function getById(req, res) {
  const { actorId } = req.params;
  const actor = await ActorRepository.getById(actorId);
  return res.json(actor);
}

async function createActor(req, res) {
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
