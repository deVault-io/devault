const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const isLoggedIn = require('../middlewares');



/* GET form view */
/* ROUTE /Tools/new 
USER PROTECTED ROUTE*/
router.get('/tools/new', isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render('newTool', { user });
});

/* POST  GET USERS NEW TOOL */
/* ROUTE /Tools/new */
router.post('/tools/new', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  const regexUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  if (!regexUrl.test(imageUrl)) {
    res.render('newTool', { error: 'image needs to be a valid http:// address'});
    return;
  }
  const {name, description, image, url,field,tag} = req.body;
  try {
    const createdTool = await Tool.create({ name, description, image, url, field,tag, user: user });
    res.redirect(`/tools/${createdTool._id}`);
  } catch (error) {
    next(error)
  }
});

/* GET one tool */
/* ROUTE /tools/:toolId */
// PUBLIC ROUTE
router.get('/tools/:toolId', async function (req, res, next) {
  // _id: { $ne: tool._id } 
  const { toolId } = req.params;
  const user = req.session.currentUser;
  try {
    const count = await Tool.countDocuments();
    const random = Math.floor(Math.random() * count);
    const tool = await Tool.findById(toolId).populate('user');
    const items = await Tool.find({field: tool.field, _id: { $ne: tool._id }}).skip(random).limit(3);
    res.render('toolDetail', { user, tool, items:items  });
    console.log(`random items:${items}`)
  } catch (error) {
    next(error)
  }
});

module.exports = router;