const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    logger.error('Error hashing password:', error);
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    logger.info('Matching password for user:', this.email);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    logger.info('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);