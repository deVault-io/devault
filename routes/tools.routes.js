const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const isLoggedIn = require('../middlewares');

/* GET all rooms */
/* ROUTE /rooms */
router.get('/', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const tools = await Tool.find({}).populate('user');
    res.render('index', { user, tools });
  } catch (error) {
    next(error)
  }
});

/* GET form view */
/* ROUTE /Tools/new */
router.get('/tools/new', isLoggedIn, function (req, res, next) {
  res.render('newTool');
});

/* POST  GET USERS NEW TOOL */
/* ROUTE /Tools/new */
router.post('/tools/new', isLoggedIn, async function (req, res, next) {
  const {name, description, image, url,field,tag} = req.body;
  try {
    const createdTool = await Tool.create({ name, description, image, url,field,tag });
    res.redirect(`/`);
  } catch (error) {
    next(error)
  }
});

module.exports = router;