const router = require('express').Router();
const Tool = require("../models/Tool.model");
const User = require("../models/User.model");
const isLoggedIn = require('../middlewares');


// @desc    App home page
// @route   GET /
// @access  Public

function flatMap(array, mapper) {
  return [].concat(...array.map(mapper));
}
router.get('/', async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const tools = await Tool.find({}).sort({ createdAt: -1 }).populate('user');
    const tag = [...new Set(flatMap(tools, tool => tool.tag))];
    res.render('index', { user, tools,tag });
  } catch (error) {
    next(error)
  }
});

module.exports = router;
