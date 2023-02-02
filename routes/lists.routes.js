const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const Favs = require("../models/Favs.model");
const List = require("../models/Lists.model");
const isLoggedIn = require('../middlewares');

/* GET lists of favs view */
/* ROUTE /Lists
USER PROTECTED ROUTE*/
router.get('/', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const lists = await List.find({user: user});
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
    const list = await List.findById(listId).populate('user');
    const favs = await Favs.find({});
    res.render('lists/favsListDetail', { user, list, favs });
  } catch (error) {
    next(error)
  }
});

/* GET one tool fav */
/* Adds tool to favList */
/* ROUTE /tools/:toolId/fav */
router.get('/:toolId/fav', isLoggedIn, async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  const tool = await Tool.findById(toolId).populate('user');
  const defaultList = await List.findOne({default: true});
  console.log(defaultList)
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