const express = require('express');

const router = express.Router();
const CommentRepository = require('../database/repositories/comment');
const { asyncMiddleware } = require('../middlewares/asyncMiddleware');

router.get('/movie/:movieId', asyncMiddleware(getAllCommentsForMovie));
router.post('/movie/:movieId', asyncMiddleware(postComment));
router.delete('/:commentId', asyncMiddleware(deleteComment));

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
  const { commentId } = req.params;
  await CommentRepository.deleteComment(commentId);
  return res.json({ message: 'Deleted' });
}

module.exports = router;
