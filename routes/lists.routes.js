const express = require('express');
const router = express.Router();
const Tool = require("../models/Tool.model");
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");
const isLoggedIn = require('../middlewares');

// @desc    lists of favorites view
// @route   GET /
// @access  Private
router.get('/', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const lists = await Lists.find({user: { $eq: user }}).populate('user');
    res.render('lists/favsList', {user, lists});
  } catch (error) {
    next(error)
  }
});

// @desc    new list view
// @route   GET /new
// @access  Private
router.get('/new', isLoggedIn, function (req, res, next) {
  res.render('lists/favsListNew');
});

// @desc    creates a new list
// @route   POST /new
// @access  Private
router.post('/new', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  const { listName, image } = req.body;
  try {
    const createdList = await Lists.create({ default: false, listName, image, user });
    res.redirect(`/lists/${createdList._id}`);
  } catch (error) {
    next(error)
  }
});

// @desc    Gets ONE list
// @route   GET /:listId
// @access  Private
router.get('/:listId', async function (req, res, next) {
  const { listId } = req.params;
  const user = req.session.currentUser;
  const list = await Lists.findById(listId);
  const tools = await Tool.find({}).populate('user');
  const favs = await Favs.find({list: { $eq: listId }}).populate('tool').populate('user').populate('list');
  try {
    res.render('lists/favsListDetail', { user, tools, list, favs });
  } catch (error) {
    next(error)
  }
});

// @desc    Tools to add to list
// @route   GET /:listId/add
// @access  Private
router.get('/:listId/add', async function (req, res, next) {
  const { listId } = req.params;
  const user = req.session.currentUser;
  try {
    const list = await Lists.findById(listId).populate("user");
    res.render("lists/favsSearch", { user, list });
  } catch (error) {
    next(error)
  }
});

// @desc    one tool fav
// @route   GET /tools/:toolId/fav
// @access  Private
router.get('/:toolId/fav', isLoggedIn, async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  const tool = await Tool.findById(toolId).populate('user');
  const defaultList = await Lists.findOne({default: true, user: user._id});
  const favExists = await Favs.findOne({tool: tool._id, list: defaultList._id, user: user._id});
  try { if (!favExists) {
    const newFav = await Favs.create({ tool: tool._id, user: user._id, list: defaultList._id });
    res.redirect(`/lists/${defaultList._id}`);
    return newFav; 
    }
  } catch (error) {
    next(error)
  }
});

module.exports = router;