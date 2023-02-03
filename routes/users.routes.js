const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");
const isLoggedIn = require('../middlewares');
const { ObjectId } = require('mongodb');


/* GET users listing. */
router.get('/profile', isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render('auth/profile', {user});
});

/* GET users listing. */
router.get('/profile/edit', isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render('auth/profileEdit', user);
});

/* POST user edit. */
router.post('/profile/edit', isLoggedIn, async (req, res, next) => {
  const { username, email } = req.body;
  const user = req.session.currentUser;
  try {
    const userInDB = await User.findByIdAndUpdate(user._id, { username, email }, { new: true });
    req.session.currentUser = userInDB;
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
});

/* GET delete Profile */
router.get("/profile/delete", isLoggedIn, async (req, res, next) => {
  const user = req.session.currentUser;
  try {
    await Lists.deleteMany({user: user._id});
    await Favs.deleteMany({user: user._id});
    await User.findByIdAndUpdate(user._id, {status: 'DELETED'});
    req.session.destroy((err) => {
      if (err) {
        next(err)
      } else {
        res.clearCookie('devault-app')
        res.redirect('/');
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;