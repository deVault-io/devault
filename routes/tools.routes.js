const express = require('express');
const router = express.Router();
const Tool = require("../models/Tool.model");
const User = require('../models/User.model');
const isLoggedIn = require('../middlewares');


/* GET form view */
/* ROUTE /Tools/new */
router.get('/tools/new', isLoggedIn, function (req, res, next) {
    res.render('newTool');
  });

module.exports = router;