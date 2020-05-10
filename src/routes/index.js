const express = require('express');

const router = express.Router();
const authRoutes = require('./authentication_routes');


router.use('/auth', authRoutes);
router.use('/', (req, res) => {
  res.send('Hi');
});

module.exports = router;
