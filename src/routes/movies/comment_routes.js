const express = require('express');

const router = express.Router();
const { CommentRepository } = require('../../database/repositories');
const { asyncMiddleware, jwtAuthMiddleware } = require('../../middlewares');
const { USER_ROLES } = require('../../constants/user_roles');

router.get('/:movieId/comments', asyncMiddleware(getAllCommentsForMovie));
router.post('/:movieId/comments', jwtAuthMiddleware(), asyncMiddleware(postComment));
router.delete('/:movieId/comments/:commentId', jwtAuthMiddleware(), asyncMiddleware(deleteComment));

async function getAllCommentsForMovie(req, res) {
  const { movieId } = req.params;
  const comments = await CommentRepository.getAllCommentsForMovie(movieId);
  const formatedComments = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const comment of comments) {
    let obj = {};
    obj = comment.comment;
    obj.user = {
      username: comment.user.username,
      imageUrl: comment.user.imageUrl,
    };
    formatedComments.push(obj);
  }
  return res.json({ comments: formatedComments });
}

async function postComment(req, res) {
  const { body: { text }, params: { movieId }, user: { id: userId } } = req;
  await CommentRepository.postComment(text, movieId, userId);
  return res.json({ message: 'Comment posted!' });
}

async function deleteComment(req, res) {
  const { id: userId, roles } = req.user;
  const { commentId, movieId } = req.params;
  if (roles.includes(USER_ROLES.ADMIN)) {
    await CommentRepository.deleteAsAdmin(movieId, commentId);
  } else {
    await CommentRepository.delete(movieId, commentId, userId);
  }
  return res.json({ message: 'Deleted' });
}

module.exports = router;
