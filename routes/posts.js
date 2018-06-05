const express = require('express');
const { Users, Posts } = require('../models');
const { auth } = require('../auth');

const Router = express.Router();

Router
  .route('/posts/:id')
  // gets post page
  .get(auth.checkLogin, (req, res, next) => {
    Posts.findById(req.params.id).populate('user').exec().then((post) => {
      const loggedIn = req.session.user_id ? true : false;

      let usersPost = null;
      if(req.session.user_id === post.user.id) {
        usersPost = true;
      } else {
        usersPost = false;
      };
      return res.render('posts/post', { post, usersPost, loggedIn, navLink: req.link, navUsername: req.username, });
    }).catch(e => {
      return next(e);
    });
  })
  // edits post
  .patch(auth.loginRequired, auth.ensureCorrectUserPost, (req, res, next) => {
    Posts.findByIdAndUpdate(req.params.id, { header: req.body.header, post: req.body.post }).then((post) => {
      return res.redirect(`/posts/${post.id}`);
    }).catch(e => {
      return next(e);
    });
  })
  // deletes post
  .delete(auth.loginRequired, auth.ensureCorrectUserPost, (req, res, next) => {
    Posts.findByIdAndRemove(req.params.id).then((post) => {

      Users.findById(req.session.user_id).then((user) => {

        user.posts.splice(user.posts.indexOf(post.id),1);
        user.likes.splice(user.likes.indexOf(post.id),1);

        user.save().then(() => {
          return res.redirect('/');
        });
      }).catch(e => {
        return next(e);
      });
    }).catch(e => {
      return next(e);
    });
  });
// edit post page
Router.route('/posts/:id/edit').get(auth.loginRequired, auth.ensureCorrectUserPost, auth.checkLogin, (req, res, next) => {
  Posts.findById(req.params.id).then((post) => {
    return res.render('posts/edit', { post, navLink: req.link, navUsername: req.username, });
  }).catch(e => {
    return next(e);
  });
});
// like button
Router.route('/posts/:id/like').post(auth.loginRequired, (req, res, next) => {
  Posts.findById(req.params.id).then((post) => {
    const postIndex = post.likes.indexOf(req.session.user_id);

    const alreadyLiked = postIndex > -1 ? true : false;

    if(alreadyLiked) {
      post.likes.splice(postIndex, 1);
    } else {
      post.likes.push(req.session.user_id);
    };
    post.save().then(() => {
      Users.findById(req.session.user_id).then((user) => {
        const userIndex = user.likes.indexOf(post.id);

        if(alreadyLiked) {
          user.likes.splice(userIndex, 1);
        } else {
          user.likes.push(post.id);
        };

        user.save().then(() => {
          return res.redirect(`/posts/${post.id}`);
        });
      }).catch(e => {
        return next(e);
      });
    });
  }).catch(e => {
    return next(e);
  });
});

module.exports = Router;
