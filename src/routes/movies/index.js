const express = require('express');

const router = express.Router();

const commentRoutes = require('./comment_routes');
const movieRoutes = require('./movie_routes');

router.use(movieRoutes, commentRoutes);

module.exports = router;
