const express = require('express');

const router = express.Router();
const authRoutes = require('./authentication_routes');
const userRoutes = require('./user_routes');
const movieRoutes = require('./movie_routes');
const categoryRoutes = require('./category_routes');
const actorRoutes = require('./actor_routes');
const cinemaRoutes = require('./cinema_routes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/movie', movieRoutes);
router.use('/category', categoryRoutes);
router.use('/actor', actorRoutes);
router.use('/cinema', cinemaRoutes);

module.exports = router;
