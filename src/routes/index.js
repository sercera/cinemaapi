const express = require('express');

const router = express.Router();
const authRoutes = require('./authentication_routes');
const userRoutes = require('./user_routes');


router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;
