const mongoose = require('mongoose');

mongoose.Promise = Promise;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog').then(() => {
}).catch(e => {
  console.log(e);
});

exports.Posts = require('./posts');
exports.Users = require('./users');
