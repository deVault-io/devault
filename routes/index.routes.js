const router = require('express').Router();
const Tool = require("../models/Tool.model");
const {flattenMap} = require("../utils")


// @desc    App home page
// @route   GET /
// @access  Public
router.get('/', async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    //agreggate to find the match betwween the tool id and its presence in the 
    //favs collection. The return is that for every tool returned to the view
    //with the favCount as a property to be printed as tools.favCount
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
    ]).exec();
    console.log(tools)
    const populatedTools = await Tool.populate(tools, { path: "user" });
    console.log(`tools ${tools}`)
    const tag = [...new Set(flattenMap(tools, tool => tool.tag))];
    res.render('index', { user,tools: populatedTools, tag });
  } catch (error) {
    next(error)
  }
});

module.exports = router;
