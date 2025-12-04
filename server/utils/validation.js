// Validation utilities for the application

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
};

const validateName = (name) => {
  return name.trim().length >= 2;
};

const validatePhone = (phone) => {
  const re = /^\+?[\d\s\-()]{10,}$/;
  return re.test(phone);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone
};