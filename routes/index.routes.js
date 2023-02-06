const router = require('express').Router();
const Tool = require("../models/Tool.model");
const User = require("../models/User.model");
const Fav = require("../models/Favs.model")
const isLoggedIn = require('../middlewares');
// const flatMap = require('../utils/index')


// @desc    App home page
// @route   GET /
// @access  Public
function flatMap(array, mapper) {
  return [].concat(...array.map(mapper));
}
router.get('/', async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const tools = await Tool.aggregate([
      {
        $lookup: {
          from: 'favs',
          localField: '_id',
          foreignField: 'tool',
          as: 'favs'
        }
      },
      {
        $addFields: {
          favCount: { $size: "$favs" }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
    ]).exec();
    const tag = [...new Set(flatMap(tools, tool => tool.tag))];
  console.log(tools[0])
    res.render('index', { user, tools, tag});
  } catch (error) {
    next(error)
  }
});

module.exports = router;
