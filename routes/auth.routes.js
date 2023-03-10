const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const List = require('../models/Lists.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const isLoggedIn = require('../middlewares');
const passport = require('passport');


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
  const { username, email, password, image, aboutMe } = req.body;
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
      const user = await User.create({ username, email, hashedPassword, image, aboutMe });
      await List.create({user: user._id, default: true});
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

// @desc    Displays form view to Login PassportJS
// @route   GET /auth/passportLogin
// @access  Public
router.get('/passportLogin', async (req, res, next) => {
  res.render('auth/passportLogin', { errorMessage: req.flash('error')} );
})

// @desc    Sends user auth data to database to authenticate user
// @route   POST /auth/login
// @access  Public
router.post('/passportLogin',
passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/passportLogin',
  failureFlash: true // !!!
})
);

// @desc    Authenticates google loggin
// @route   GET /google
// @access  Public
router.get(
  "/google",
  passport.authenticate("google", {
    keepSessionInfo: true,
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
);

// @desc    Autehtnticates google loggin
// @route   GET /google/callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    keepSessionInfo: true
  }),
    async function (req, res) {
      try {
        const user = await User.findById(req.session.passport.user);
        req.session.currentUser = user;
        const listCreated = await List.findOne({ user: user._id, default: true});
        if (!listCreated) {
          await List.create({user: user._id, default: true});
        }
        res.redirect('/profile')
      }
      catch(err) {
        res.redirect('/')
      }
    }
  );

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
