const Address = require('../models/Address');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all addresses for a user
// @route   GET /api/address
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch addresses', error: error.message });
  }
});

// @desc    Get address by ID
// @route   GET /api/address/:id
// @access  Private
const getAddressById = asyncHandler(async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }
    
    res.json(address);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to fetch address', error: error.message });
  }
});

// @desc    Create a new address
// @route   POST /api/address
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
  try {
    const {
      fullName,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = req.body;
    
    const address = new Address({
      user: req.user._id,
      fullName,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    });
    
    const createdAddress = await address.save();
    res.status(201).json(createdAddress);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create address', error: error.message });
  }
});

// @desc    Update an address
// @route   PUT /api/address/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  try {
    const {
      fullName,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = req.body;
    
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }
    
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.phone = phone || address.phone;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
    
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to update address', error: error.message });
  }
});

// @desc    Delete an address
// @route   DELETE /api/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }
    
    await address.remove();
    res.json({ message: 'Address removed' });
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to delete address', error: error.message });
  }
});

// @desc    Set address as default
// @route   PUT /api/address/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  try {
    // First unset default flag on all addresses for this user
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );
    
    // Then set the specified address as default
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }
    
    address.isDefault = true;
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    if (res.statusCode === 404) {
      throw error;
    }
    res.status(500).json({ message: 'Failed to set default address', error: error.message });
  }
});

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};