const express = require('express');
const { Users, Posts } = require('../models');
const { auth } = require('../auth');

const Router = express.Router();

// index page displays all blog posts
Router.route('/').get(auth.checkLogin, (req, res, next) => {
  Posts.find().populate('user').exec().then((posts) => {
    posts = posts.reverse();
    return res.render('home', { posts, navLink: req.link, navUsername: req.username });
  }).catch(e => {
    return next(e);
  });
});
// login/signup page
Router
  .route('/login')
  .get(auth.checkLogin, (req, res, next) => {
    if(req.session.user_id) {
      return res.redirect('/');
    };
    return res.render('login', { navLink: req.link, navUsername: req.username });
  })
  // login form
  .post((req, res, next) => {
    Users.findOne({ email: req.body.email }).then((user) => {
      user.comparePassword(req.body.password, (err, isMatch) => {
        if(isMatch) {
          req.session.user_id = user.id;
          return res.redirect('/');
        } else {
          return res.redirect('/login');
        };
      });
    }).catch(e => {
      return next(e);
    });
  });
// signup form
Router.route('/signup').post((req, res, next) => {
    Users.create({ fullName: req.body.fullName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password }).then((user) => {
        req.session.user_id = user.id;
        return res.redirect('/');
    }).catch(e => {
      return next(e);
    });
  });
// logout
Router.route('/logout').post((req, res, next) => {
  req.session.user_id = null;
  return res.redirect('/');
});

module.exports = Router;
