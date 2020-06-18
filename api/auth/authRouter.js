const express = require('express');

const router = express.Router();

router.use('/auth', require('./authentication/authenticationRouter'));
router.use('/users', require('./user/userRouter'));

module.exports = router;
