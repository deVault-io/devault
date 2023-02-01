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
    console.log(lists)
    console.log(lists.user)
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
    res.render('lists/favsListDetail', { user, list });
  } catch (error) {
    next(error)
  }
});


module.exports = router;