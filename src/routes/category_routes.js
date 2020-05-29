const express = require('express');

const router = express.Router();
const { CategoryRepository } = require('../database/repositories');
const { asyncMiddleware, jwtAuthMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCategories));
router.post('/', asyncMiddleware(createCategory));
router.post('/:id/like', jwtAuthMiddleware(), asyncMiddleware(favCategory));
router.put('/like', jwtAuthMiddleware(), asyncMiddleware(favCategories));
router.post('/:id', asyncMiddleware(updateCategory));
router.delete('/:id', asyncMiddleware(deleteCategory));

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

async function favCategory(req, res) {
  const {
    user: { id: userId },
    params: { id: categoryId },
  } = req;
  await CategoryRepository.likeCategory(userId, categoryId);
  return res.json({ message: 'Category liked' });
}

async function favCategories(req, res) {
  const {
    user: { id: userId },
    body: { categoryIds },
  } = req;
  await CategoryRepository.likeCategories(userId, categoryIds);
  return res.json({ message: 'Categories likes' });
}

module.exports = router;
