const { Users, Posts } = require('../models');
// checks if logged in
function checkLogin(req, res, next) {
  if(!req.session.user_id) {
    req.link = '/login';
    req.username = 'Log in';
    return next();
  } else {
    Users.findById(req.session.user_id).then((user) => {
      req.link = `/users/${user.username}/posts`;
      req.username = user.username;
      return next();
    }).catch(e => {
      next(e);
    });
  };
};
// login is required
function loginRequired(req, res, next) {
  if(!req.session.user_id) {
    return res.redirect('/login');
  };
  return next();
};
// ensures the correct user is doing the action
function ensureCorrectUser(req, res, next) {
  Users.findById(req.session.user_id)
  .then((user) => {
    if(req.params.username !== user.username && user.isAdmin !== true) {
      return res.redirect('/login');
    };
    return next();
  }).catch(e => {
    return next(e);
  });
};
// ensures the correct users post before doing action
function ensureCorrectUserPost(req, res, next) {
  Posts.findById(req.params.id).then((post) => {
    Users.findById(req.session.user_id).then((user) => {
      if(post.user.toString() !== user.id && user.isAdmin !== true) {
        return res.redirect('/login');
      };
      return next();
    }).catch(e => {
      return next(e);
    });
  }).catch(e => {
    return next(e);
  });
};

module.exports = {
  checkLogin,
  loginRequired,
  ensureCorrectUser,
  ensureCorrectUserPost,
};
