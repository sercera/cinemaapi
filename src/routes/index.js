const express = require('express');

const router = express.Router();
const authRoutes = require('./authentication_routes');
const userRoutes = require('./user_routes');
const movieRoutes = require('./movie_routes');


router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/movie', movieRoutes);

module.exports = router;
