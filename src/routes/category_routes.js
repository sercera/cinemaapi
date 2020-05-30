const express = require('express');

const router = express.Router();
const { CategoryRepository } = require('../database/repositories');
const { USER_ROLES } = require('../constants/user_roles');
const { asyncMiddleware, roleAuthMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCategories));
router.post('/', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(createCategory));
router.post('/:id/like', asyncMiddleware(likeCategory));
router.put('/like', asyncMiddleware(changeLikedCategories));
router.get('/like', asyncMiddleware(getLikedCategories));
router.post('/:id', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(updateCategory));
router.delete('/:id', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(deleteCategory));

async function getAllCategories(req, res) {
  const { limit, skip, sort } = req.query;
  const categories = await CategoryRepository.getAll({ limit, skip, sort });
  return res.json(categories);
}

async function createCategory(req, res) {
  const category = await CategoryRepository.create(req.body);
  return res.json(category);
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const category = await CategoryRepository.update(id, req.body);
  return res.json(category);
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  const response = await CategoryRepository.deleteById(id);
  return res.json(response);
}

async function getLikedCategories(req, res) {
  const { id } = req.user;
  return res.json(await CategoryRepository.getLikedCategories(id));
}

async function likeCategory(req, res) {
  const {
    user: { id: userId },
    params: { id: categoryId },
  } = req;
  await CategoryRepository.likeCategory(userId, categoryId);
  return res.json({ message: 'Category liked' });
}

async function changeLikedCategories(req, res) {
  const {
    user: { id: userId },
    body: { categoryIds },
  } = req;
  await CategoryRepository.likeCategories(userId, categoryIds);
  return res.json({ message: 'Categories likes' });
}

module.exports = router;
