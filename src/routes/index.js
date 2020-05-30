const express = require('express');

const router = express.Router();
const authRoutes = require('./authentication_routes');
const userRoutes = require('./user_routes');
const movieRoutes = require('./movies');
const categoryRoutes = require('./category_routes');
const actorRoutes = require('./actor_routes');
const cinemaRoutes = require('./cinema_routes');
const projectionRoutes = require('./projection_routes');
const notificationRoutes = require('./notification');

const { jwtAuthMiddleware } = require('../middlewares');

router.use('/auth', authRoutes);

router.use('/actors', jwtAuthMiddleware(), actorRoutes);
router.use('/categories', jwtAuthMiddleware(), categoryRoutes);
router.use('/cinemas', jwtAuthMiddleware(), cinemaRoutes);
router.use('/users', jwtAuthMiddleware(), userRoutes);
router.use('/movies', jwtAuthMiddleware(), movieRoutes);
router.use('/projections', jwtAuthMiddleware(), projectionRoutes);
router.use('/notifications', jwtAuthMiddleware(), notificationRoutes);

module.exports = router;
