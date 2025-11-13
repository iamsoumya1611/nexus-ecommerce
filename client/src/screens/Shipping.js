import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../actions/cartActions';

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-primary-900 mb-6 text-center">Shipping Information</h1>
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-primary-700 mb-2">
              Address
            </label>
            <input
              type="text"
              className="form-input w-full"
              id="address"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block text-sm font-medium text-primary-700 mb-2">
              City
            </label>
            <input
              type="text"
              className="form-input w-full"
              id="city"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="postalCode" className="block text-sm font-medium text-primary-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              className="form-input w-full"
              id="postalCode"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="country" className="block text-sm font-medium text-primary-700 mb-2">
              Country
            </label>
            <input
              type="text"
              className="form-input w-full"
              id="country"
              placeholder="Enter country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;