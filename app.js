require('dotenv').config();
require('./db');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();

// cookies and loggers
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// For deployment
app.set('trust proxy', 1);
app.use(
  session({
    name: 'devault-app',
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 2592000000 // 30 days in milliseconds
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL
    })
  }) 
)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials'); 

// routes intro
// 👇 Routes here
const indexRoutes = require("./routes/index.routes");
const usersRoutes = require("./routes/users.routes");
const toolsRoutes = require("./routes/tools.routes");
const authRoutes = require("./routes/auth.routes");
const listsRoutes = require("./routes/lists.routes")
const favsRoutes = require("./routes/favs.routes")

app.use("/", indexRoutes);
app.use("/", usersRoutes);
app.use("/", toolsRoutes);
app.use("/lists", listsRoutes);
app.use("/auth", authRoutes);
app.use("/favs", favsRoutes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  if (err.status === 404) {
    res.render('404', { path: req.url });
  } else {
    res.status(err.status || 500);
    res.render('error');
  }
});

module.exports = app;
