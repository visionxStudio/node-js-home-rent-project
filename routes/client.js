const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client');
const isAdmin = require('../middleware/isAdmin');

router.get('/',isAdmin, clientController.getIndex);


module.exports = router;