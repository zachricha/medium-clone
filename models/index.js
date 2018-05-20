const mongoose = require('mongoose');

mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost:27017/blog', {}).then(() => {
  console.log('mongdb connected!');
}).catch(e => {
  console.log(e);
});

exports.Posts = require('./posts');
exports.Users = require('./users');
