const Address = require('../models/Address');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  badRequestResponse
} = require('../utils/apiResponse');

// @desc    Get all addresses for a user
// @route   GET /api/address
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    
    console.log('User addresses fetched successfully:', {
      userId: req.user._id,
      addressCount: addresses.length
    });
    
    res.json(successResponse(addresses, 'Addresses fetched successfully'));
  } catch (error) {
    console.error('Error fetching addresses:', {
      error: error.message,
      userId: req.user._id
    });
    
    res.status(500).json(errorResponse(error, 'Failed to fetch addresses'));
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
      console.warn('Address not found:', {
        addressId: req.params.id,
        userId: req.user._id
      });
      
      return res.status(404).json(notFoundResponse('Address'));
    }
    
    console.log('Address fetched successfully:', {
      addressId: address._id,
      userId: req.user._id
    });
    
    res.json(successResponse(address, 'Address fetched successfully'));
  } catch (error) {
    console.error('Error fetching address:', {
      error: error.message,
      addressId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid address ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to fetch address'));
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
    
    // Validate required fields
    if (!fullName || !streetAddress || !city || !state || !postalCode || !country || !phone) {
      console.warn('Missing required fields for address creation:', {
        userId: req.user._id,
        missingFields: [
          !fullName && 'fullName',
          !streetAddress && 'streetAddress',
          !city && 'city',
          !state && 'state',
          !postalCode && 'postalCode',
          !country && 'country',
          !phone && 'phone'
        ].filter(Boolean)
      });
      
      return res.status(400).json(badRequestResponse('All address fields are required'));
    }
    
    const address = new Address({
      user: req.user._id,
      fullName,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: isDefault || false
    });
    
    const createdAddress = await address.save();
    
    console.log('Address created successfully:', {
      addressId: createdAddress._id,
      userId: req.user._id
    });
    
    res.status(201).json(successResponse(createdAddress, 'Address created successfully', 201));
  } catch (error) {
    console.error('Error creating address:', {
      error: error.message,
      userId: req.user._id,
      body: req.body
    });
    
    res.status(500).json(errorResponse(error, 'Failed to create address'));
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
      console.warn('Address not found for update:', {
        addressId: req.params.id,
        userId: req.user._id
      });
      
      return res.status(404).json(notFoundResponse('Address'));
    }
    
    // Update fields if provided
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.phone = phone || address.phone;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
    
    const updatedAddress = await address.save();
    
    console.log('Address updated successfully:', {
      addressId: updatedAddress._id,
      userId: req.user._id
    });
    
    res.json(successResponse(updatedAddress, 'Address updated successfully'));
  } catch (error) {
    console.error('Error updating address:', {
      error: error.message,
      addressId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid address ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to update address'));
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
      console.warn('Address not found for deletion:', {
        addressId: req.params.id,
        userId: req.user._id
      });
      
      return res.status(404).json(notFoundResponse('Address'));
    }
    
    await address.remove();
    
    console.log('Address deleted successfully:', {
      addressId: address._id,
      userId: req.user._id
    });
    
    res.json(successResponse(null, 'Address deleted successfully'));
  } catch (error) {
    console.error('Error deleting address:', {
      error: error.message,
      addressId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid address ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to delete address'));
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
      console.warn('Address not found when setting as default:', {
        addressId: req.params.id,
        userId: req.user._id
      });
      
      return res.status(404).json(notFoundResponse('Address'));
    }
    
    address.isDefault = true;
    const updatedAddress = await address.save();
    
    console.log('Address set as default successfully:', {
      addressId: updatedAddress._id,
      userId: req.user._id
    });
    
    res.json(successResponse(updatedAddress, 'Address set as default successfully'));
  } catch (error) {
    console.error('Error setting address as default:', {
      error: error.message,
      addressId: req.params.id,
      userId: req.user._id
    });
    
    if (error.name === 'CastError') {
      return res.status(400).json(badRequestResponse('Invalid address ID'));
    }
    
    res.status(500).json(errorResponse(error, 'Failed to set default address'));
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