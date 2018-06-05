require('dotenv').load();

const secret = process.env.SECRET_KEY;

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const methodOverride = require('method-override');
const ejs = require('ejs');
const session = require('cookie-session');
const { auth } = require('./auth');

const { homeRoutes, postRoutes, userRoutes } = require('./routes');

const port = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({secret}));

app.use(homeRoutes, postRoutes, userRoutes);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

app.use(auth.checkLogin, (err, req, res, next) => {
  res.status = (err.status || 500);
  res.render('error', {
    eMessage: err.message,
    navLink: req.link,
    navUsername: req.username,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
