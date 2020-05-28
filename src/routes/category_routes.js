const express = require('express');

const router = express.Router();
const { CategoryRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getAllCategories));
router.post('/', asyncMiddleware(createCategory));

async function getAllCategories(req, res) {
  const categories = await CategoryRepository.getAll();
  return res.json(categories);
}

async function createCategory(req, res) {
  const { name } = req.body;
  await CategoryRepository.create(name);
  return res.json({ message: `Category ${name} created` });
}

module.exports = router;
