const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");
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
  /* const regexUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  if (!regexUrl.test(imageUrl)) {
    res.render('newTool', { error: 'image needs to be a valid http:// address'});
    return;
  } */
  const {name, description, image, url, field, tag} = req.body;
  try {
    const createdTool = await Tool.create({ name, description, image, url, field, tag, user: user });
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
  if (!req.session.currentUser) {
    const tool = await Tool.findById(toolId).populate('user');
    const count = await Tool.count({field:`${tool.field}`});
  if (count <= 3){
    const items = await Tool.aggregate([{$sample: {size: 3}}]);
    res.render('toolDetail', { user, tool, items:items });
    return items
  } else{
    const itemsToRandom = await Tool.find({field: `${tool.field}`, _id: { $ne: tool._id }});
    const items = itemsToRandom.sort(()=> 0.5- Math.random()).slice(0,3);
    res.render('toolDetail', { user, tool, items:items });
    return items;
  }
    
  } try {
    const count = await Tool.countDocuments();
    const random = Math.floor(Math.random() * count);
    const tool = await Tool.findById(toolId).populate('user');
    const items = await Tool.find({field: tool.field, _id: { $ne: tool._id }}).skip(random).limit(3);
    const isLoggedInUserCreator = tool.user._id.toString() == user._id ? true : false;
    res.render('toolDetail', { user, tool, items:items, isLoggedInUserCreator });
    console.log(`random items:${items}`)
  } catch (error) {
    next(error)
  }
});

/* GET one tool edit */
/* ROUTE /tools/:toolId/edit */
router.get('/tools/:toolId/edit', async function (req, res, next) {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  try {
    const tool = await Tool.findById(toolId).populate('user');
    res.render('toolEdit', { user, tool });
  } catch (error) {
    next(error)
  }
});

/* POST Tool Update */
/* ROUTE tools/:toolId/edit */
router.post('/tools/:toolId/edit', async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  const { name, description, image, url, field, tag } = req.body;
  try {
    const tool = await Tool.findById(toolId).populate('user');
    const editedTool = await Tool.findByIdAndUpdate(toolId, { name, description, image, url, field, tag, user: user }, {new:true})
    res.redirect(`/tools/${editedTool._id}`)
  } catch (error) {
    next(error)
  }
});

/* GET one tool fav */
/* Adds tool to favList */
/* ROUTE /tools/:toolId/fav */
router.get('/tools/:toolId/fav', async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  try {
    const tool = await Tool.findById(toolId).populate('user');
    const editedlist = await Lists.findOne({listName: 'My Favourites'});
    const fav = await Favs.create({ tool: tool._id, user: user._id, list: editedlist._id }) 
    res.render(`lists/${editedlist._id}`, { user, tool, editedlist, fav });
  } catch (error) {
    next(error)
  }
});

/* GET delete Tool */
/* ROUTE tools/:toolId/delete */
router.get('/tools/:toolId/delete', async (req, res, next) => {
  const user = req.session.currentUser;
  const { toolId } = req.params;
  try {
    const tool = await Tool.findById(toolId).populate('user');
      await Tool.findByIdAndRemove(toolId);
      res.redirect('/')
  } catch (error) {
    next(error)
  }
});

module.exports = router;