const express = require('express');
const router = express.Router();
const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');
const { validateAddress } = require('../middleware/validationMiddleware');

// All routes are protected
router.route('/')
  .get(protect, getAddresses)
  .post(protect, validateAddress, createAddress);

router.route('/:id')
  .get(protect, getAddressById)
  .put(protect, validateAddress, updateAddress)
  .delete(protect, deleteAddress);

router.route('/:id/default')
  .put(protect, setDefaultAddress);

module.exports = router;