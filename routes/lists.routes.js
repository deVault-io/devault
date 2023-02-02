const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");
const isLoggedIn = require('../middlewares');

/* GET lists of favs view */
/* ROUTE /Lists
USER PROTECTED ROUTE*/
router.get('/', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const lists = await Lists.find({user: user});
    res.render('lists/favsList', {user, lists});
  } catch (error) {
    next(error)
  }
});

/* GET One list */
router.get('/:listId', async function (req, res, next) {
  const { listId } = req.params;
  const user = req.session.currentUser;
  try {
    const list = await Lists.findById(listId).populate('user');
    const favs = await Favs.find({});
    res.render('lists/favsListDetail', { user, list, favs });
  } catch (error) {
    next(error)
  }
});

/* GET one tool fav */
/* Adds tool to favList */
/* ROUTE /tools/:toolId/fav */
router.get('/:toolId/fav', async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  try {
    const tool = await Tool.findById(toolId).populate('user');
    const editedlist = await Lists.findOne({listName: 'My Favourites'});
    const fav = await Favs.create({ tool: tool._id, user: user._id, list: editedlist._id });
    res.render(`lists/favsList`, { user, tool, editedlist, fav });
  } catch (error) {
    next(error)
  }
});


module.exports = router;