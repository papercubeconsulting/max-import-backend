const express = require('express');

const router = express.Router();

router.use('/families', require('./family/familyRoute'));

module.exports = router;
