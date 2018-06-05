const express = require('express');
const { Users, Posts } = require('../models');
const { auth } = require('../auth');

const Router = express.Router();

// creates a post
Router.route('/users/:username')
.post(auth.loginRequired, auth.ensureCorrectUser, (req, res, next) => {
    const newPost = new Posts(req.body);
    newPost.user = req.session.user_id;

    return newPost.save().then((post) => {
      return Users.findOneAndUpdate(
        { username: req.params.username },
      { $addToSet: { posts: post._id } });
    }).then(() => {
      return res.redirect('/');
    }).catch(e => {
      return next(e);
    });
  });

// displays user info and user posts
Router.route('/users/:username/posts').get(auth.checkLogin, (req, res, next) => {
  Users.findOne({ username: req.params.username }).populate('posts').exec().then((user) => {
    let sameUser = null;

    if(req.session.user_id === user.id) {
      sameUser = true;
    } else {
      sameUser = false;
    };
    return res.render('users/posts', { user, sameUser, navLink: req.link, navUsername: req.username, });
  }).catch(e => {
    return next(e);
  });
});
// displays user info and user likes
Router.route('/users/:username/likes').get(auth.checkLogin, (req, res, next) => {
  Users.findOne({ username: req.params.username }).populate({ path: 'likes', populate: { path: 'user' }}).exec().then((user) => {
    let sameUser = null;

    if(req.session.user_id === user.id) {
      sameUser = true;
    } else {
      sameUser = false;
    };
    return res.render('users/likes', { user, sameUser, navLink: req.link, navUsername: req.username, });
  }).catch(e => {
    return next(e);
  });
});
// gets form for creating a post
Router.route('/users/:username/post').get(auth.loginRequired, auth.ensureCorrectUser, auth.checkLogin, (req, res, next) => {
  Users.findOne({ username: req.params.username }).then((user) => {
    return res.render('users/createPost', { user, navLink: req.link, navUsername: req.username, });
  }).catch(e => {
    return next(e);
  });
});

Router
  // gets settings page for user
  .route('/users/:username/settings')
  .get(auth.loginRequired, auth.ensureCorrectUser, auth.checkLogin, (req, res, next) => {
    Users.findOne({ username: req.params.username }).then((user) => {
      return res.render('users/settings', { user, navLink: req.link, navUsername: req.username, });
    }).catch(e => {
      return next(e);
    });
  })
  // delete user
  .delete(auth.loginRequired, auth.ensureCorrectUser, (req, res, next) => {
    Users.findOneAndRemove({ username: req.params.username }).populate('likes').exec()
    .then((user) => {
      req.session.user_id = null;

      Posts.deleteMany({ user: user.id }).then(() => {
        user.likes.forEach((post) => {
          const likeIndex = post.likes.indexOf(user.id);

          if(likeIndex > -1 && post.user.toString() !== user.id) {
            post.likes.splice(likeIndex, 1);
            post.save();
          };
        });
        return res.redirect(`/users/${user.username}/settings`);
      }).catch(e => {
        return next(e);
      });
    }).catch(e => {
      return next(e);
    });
  });
// updates email
Router.route('/users/:username/update/email')
.patch(auth.loginRequired, auth.ensureCorrectUser, (req, res, next) => {
  Users.findOneAndUpdate({ username: req.params.username },
  { email: req.body.email }).then((user) => {

    return res.redirect(`/users/${user.username}/settings`);
  }).catch(e => {
    return next(e);
  });
});
// updates bio
Router.route('/users/:username/update/bio')
.patch(auth.loginRequired, auth.ensureCorrectUser, (req, res, next) => {
  Users.findOneAndUpdate({ username: req.params.username },
  { bio: req.body.bio }).then((user) => {

    return res.redirect(`/users/${user.username}/settings`);
  }).catch(e => {
    return next(e);
  });
});
// updates password
Router.route('/users/:username/update/password')
.patch(auth.loginRequired, auth.ensureCorrectUser, (req, res, next) => {

  if(req.body.password === req.body.password2) {
    Users.findOne({ username: req.params.username }).then((user) => {

      user.comparePassword(req.body.oldPassword, (err, isMatch) => {
        if(isMatch) {
          user.password = req.body.password;
          user.save().then(() => {
            return res.redirect(`/users/${user.username}/settings`);
          });
        } else {
          return res.redirect(`/users/${user.username}/settings`);
        };
      });
    }).catch(e => {
      return next(e);
    });
  };
});

module.exports = Router;
