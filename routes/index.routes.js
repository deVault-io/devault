const router = require('express').Router();
const Tool = require("../models/Tool.model");
const isLoggedIn = require('../middlewares');

// @desc    App home page
// @route   GET /
// @access  Public
router.get('/', async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const tools = await Tool.find({});
    res.render('index', { tools });
    console.log(tools);
  } catch (error) {
    next(error)
  }
});

module.exports = router;
