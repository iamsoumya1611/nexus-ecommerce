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
    logger.info('Password not modified, skipping hash');
    next();
    return;
  }

  try {
    logger.info('Hashing password for user:', this.email);
    logger.info(`Plain password length: ${this.password ? this.password.length : 0}`);
    
    const salt = await bcrypt.genSalt(10);
    logger.info('Salt generated');
    
    this.password = await bcrypt.hash(this.password, salt);
    logger.info('Password hashed successfully');
    logger.info(`Hashed password length: ${this.password ? this.password.length : 0}`);
    
    next();
  } catch (error) {
    logger.error('Error hashing password:', {
      message: error.message,
      stack: error.stack,
      email: this.email
    });
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    // Validate inputs
    if (!enteredPassword) {
      logger.warn('No password provided for comparison');
      return false;
    }
    
    if (!this.password) {
      logger.error('No stored password found for user:', this.email);
      return false;
    }
    
    logger.info('Matching password for user:', this.email);
    logger.info(`Entered password length: ${enteredPassword ? enteredPassword.length : 0}`);
    logger.info(`Stored password length: ${this.password ? this.password.length : 0}`);
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    logger.info('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    logger.error('Error comparing passwords:', {
      message: error.message,
      stack: error.stack,
      email: this.email
    });
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);