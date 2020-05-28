const express = require('express');

const router = express.Router();
const { MovieRepository } = require('../../database/repositories');
const { asyncMiddleware } = require('../../middlewares');

router.get('/actors/:actorId', asyncMiddleware(getMoviesByActor));
router.post('/:movieId/actors/:actorId', asyncMiddleware(addActorToMovie));
router.delete('/:movieId/actors/:actorId', asyncMiddleware(deleteActorToMovie));


async function getMoviesByActor(req, res) {
  const { actorId } = req.params;

  const movies = await MovieRepository.getByActor(actorId);
  return res.json({ movies });
}

async function addActorToMovie(req, res) {
  const { actorId, movieId } = req.params;
  await MovieRepository.addActorToMovie(actorId, movieId);
  return res.json({ message: 'Success' });
}

async function deleteActorToMovie(req, res) {
  const { actorId, movieId } = req.params;
  await MovieRepository.removeActorFromMovie(actorId, movieId);
  return res.json({ message: 'Success' });
}


module.exports = router;
