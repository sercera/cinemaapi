const express = require('express');

const router = express.Router();

const commentRoutes = require('./comment_routes');
const movieRoutes = require('./movie_routes');
const movieActorRoutes = require('./actor_routes');

router.use(movieRoutes, commentRoutes, movieActorRoutes);

module.exports = router;
