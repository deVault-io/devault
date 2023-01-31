const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const Favs = require("../models/Favs.model");
const isLoggedIn = require('../middlewares');

/* GET favs view */
/* ROUTE /Favs
USER PROTECTED ROUTE*/
router.get('/', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const favs = await Favs.find({});
    res.render('favs/favsList', { user, favs });
  } catch (error) {
    next(error)
  }
});

module.exports = router;