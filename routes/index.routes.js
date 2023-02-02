const router = require('express').Router();
const Tool = require("../models/Tool.model");
const User = require("../models/User.model");
const isLoggedIn = require('../middlewares');

// @desc    App home page
// @route   GET /
// @access  Public
router.get('/', async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const tools = await Tool.find({}).sort({ timestamp: 1 }).populate('user');
    res.render('index', { user, tools });
  } catch (error) {
    next(error)
  }
});

module.exports = router;
