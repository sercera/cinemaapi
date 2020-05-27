const express = require('express');

const router = express.Router();
const { CommentRepository } = require('../../database/repositories');
const { asyncMiddleware } = require('../../middlewares/asyncMiddleware');

router.get('/:movieId/comments', asyncMiddleware(getAllCommentsForMovie));
router.post('/:movieId/comments', asyncMiddleware(postComment));
router.delete('/:movieId/comments/:commentId', asyncMiddleware(deleteComment));

async function getAllCommentsForMovie(req, res) {
  const { movieId } = req.params;
  const comments = await CommentRepository.getAllCommentsForMovie(movieId);
  return res.json({ comments });
}

async function postComment(req, res) {
  const { body: { text, userId }, params: { movieId } } = req;
  await CommentRepository.postComment(text, movieId, userId);
  return res.json({ message: 'Comment posted!' });
}

async function deleteComment(req, res) {
  const { commentId, movieId } = req.params;
  await CommentRepository.delete(movieId, commentId);
  return res.json({ message: 'Deleted' });
}

module.exports = router;
