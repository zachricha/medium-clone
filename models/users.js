const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    default: 'Bio',
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    }
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    }
  ]
});

userSchema.pre('save', function(next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  };

  return bcrypt
    .hash(user.password, 10)
    .then(hashedPassword => {
      user.password = hashedPassword;
      return next();
    }, (e) => {
      return next(e);
    });
});

userSchema.methods.comparePassword = function(candidatePassword, next) {
  return bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if(err) {
      return next(err);
    }
    return next(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
