module.exports = isLoggedIn = (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/auth/login')
  } else {
    next()
  }
};

//Create Middleware para el user creator (Guille)