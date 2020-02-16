const express = require('express');

const router = express.Router();

router.use('/families', require('./family/familyRoute'));
router.use('/subfamilies', require('./subfamily/subfamilyRoute'));

module.exports = router;
