const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const List = require('../models/Lists.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const isLoggedIn = require('../middlewares');

//Test
// @desc    Displays form view to sign up
// @route   GET /auth/signup
// @access  Public
router.get('/signup', async (req, res, next) => {
  res.render('auth/signup');
})

// @desc    Sends user auth data to database to create a new user
// @route   POST /auth/signup
// @access  Public
router.post('/signup', async function (req, res, next) { 
  const { username, email, password, avatar, aboutMe } = req.body;
  if (!username || !email || !password) {
    res.render('auth/signup', { error: 'All fields are necessary.' });
    return;
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.render('auth/signup', { error: 'Password needs to contain at least 6 characters, one number, one lowercase and one uppercase letter.' });
    return;
  }
  try {
    const userInDB = await User.findOne({ email: email });
    if (userInDB) {
      res.render('auth/signup', { error: `There already is a user with email ${email}` });
      return;
    } else {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({ username, email, hashedPassword, avatar, aboutMe });
      await List.create({user: user._id, default: false});
      req.session.currentUser = user; 
      res.render('auth/profile', {user});
    }
  } catch (error) {
    next(error)
  }
});

// @desc    Displays form view to log in
// @route   GET /auth/login
// @access  Public
router.get('/login', async (req, res, next) => {
  const user = req.session.currentUser;
  res.render('auth/login', user);
})

// @desc    Sends user auth data to database to authenticate user
// @route   POST /auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.render('auth/login', { error: 'Introduce email and password to log in' });
    return;
  }
  try {
    const userInDB = await User.findOne({ email: email, status: 'ACTIVE' });
    if (!userInDB) {
      res.render('auth/login', { error: `There are no users by ${email}` });
      return;
    } else {
      const passwordMatch = await bcrypt.compare(password, userInDB.hashedPassword);
      if (passwordMatch) {
        req.session.currentUser = userInDB;
        res.render('auth/profile', {user: userInDB});
      } else {
        res.render('auth/login',  { error: 'Unable to authenticate user' });
        return;
      }
    }
  } catch (error) {
    next(error)
  }
});

// @desc    Destroy user session and log out
// @route   POST /auth/logout
// @access  Private 
router.get('/logout', isLoggedIn, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err)
    } else {
      res.clearCookie('devault-app')
      res.redirect('/');
    }
  });
});

module.exports = router;
