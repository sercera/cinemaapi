const express = require('express');

const router = express.Router();
const { CategoryRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCategories));
router.post('/', asyncMiddleware(createCategory));
router.delete('/:id', asyncMiddleware(deleteCategory));


async function getAllCategories(req, res) {
  const categories = await CategoryRepository.getAll();
  return res.json({ categories });
}

async function createCategory(req, res) {
  const category = await CategoryRepository.create(req.body);
  return res.json({ category });
}


async function deleteCategory(req, res) {
  const { id } = req.params;
  const response = await CategoryRepository.deleteById(id);
  return res.json(response);
}

module.exports = router;
