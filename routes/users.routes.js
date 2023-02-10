const express = require('express');
const router = express.Router();
const User = require("../models/User.model");
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");
const isLoggedIn = require('../middlewares');
const fileUploader = require("../config/cloudinary.config");

// @desc    Profile view
// @route   GET /profile
// @access  Private
router.get('/profile', isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render('auth/profile', {user});
});

// @desc    Edit profile view
// @route   GET /profile/edit
// @access  Private
router.get('/profile/edit', isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render('auth/profileEdit', user);
});

// @desc    Edit profile view post
// @route   POST /profile/edit
// @access  Private
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

// @desc    Edit profile view
// @route   GET /profile/edit
// @access  Private
router.get('/profile/editAvatar', isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render('auth/profileEditAvatar', user);
});

// @desc    Edit profile view post
// @route   POST /profile/edit
// @access  Private
router.post('/profile/editAvatar', isLoggedIn, fileUploader.single("image"), async (req, res, next) => {
  const { image } = req.body;
  const user = req.session.currentUser;
  try {
    const userInDB = await User.findByIdAndUpdate(user._id, { image: req.file.path, }, { new: true });
    console.log(userInDB)
    req.session.currentUser = userInDB;
    res.redirect('/profile');
  } catch (error) {
    next(error);
  }
});

// @desc    lists of favorites view
// @route   GET /
// @access  Private
router.get('/profile/lists', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const lists = await Lists.find({user: { $eq: user }}).populate('user');
    res.render('lists/favsListProfile', {user, lists});
  } catch (error) {
    next(error)
  }
});

// @desc    Delete profile 
// @route   GET /profile/edit
// @access  Private
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