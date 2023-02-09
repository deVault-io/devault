module.exports = isLoggedIn = (req, res, next) => {
  if (!req.session.currentUser || !req.session.passport.user) {
    res.redirect('/auth/login')
  } else {
    next()
  }
};
