const express = require('express');

const router = express.Router();
const authRoutes = require('./authentication_routes');
const userRoutes = require('./user_routes');
const movieRoutes = require('./movies');
const categoryRoutes = require('./category_routes');
const actorRoutes = require('./actor_routes');
const cinemaRoutes = require('./cinema_routes');
const projectionRoutes = require('./projection_routes');

router.use('/auth', authRoutes);

router.use('/actors', actorRoutes);
router.use('/categories', categoryRoutes);
router.use('/cinemas', cinemaRoutes);
router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.use('/projections', projectionRoutes);

module.exports = router;
