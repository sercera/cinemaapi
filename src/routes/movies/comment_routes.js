const express = require('express');

const router = express.Router();
const { CommentRepository } = require('../../database/repositories');
const { asyncMiddleware } = require('../../middlewares');

router.get('/:movieId/comments', asyncMiddleware(getAllCommentsForMovie));
router.post('/:movieId/comments', asyncMiddleware(postComment));
router.delete('/:movieId/comments/:commentId', asyncMiddleware(deleteComment));

async function getAllCommentsForMovie(req, res) {
  const { movieId } = req.params;
  const comments = await CommentRepository.getAllCommentsForMovie(movieId);
  const formatedComments = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const comment of comments) {
    let obj = {};
    obj = comment.comment;
    obj.user = comment.user.username;
    formatedComments.push(obj);
  }
  return res.json({ comments: formatedComments });
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
