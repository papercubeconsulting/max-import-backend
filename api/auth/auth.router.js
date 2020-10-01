const express = require('express');

const router = express.Router();

router.use('/auth', require('./authentication/authentication.router'));
router.use('/users', require('./user/user.router'));

module.exports = router;
