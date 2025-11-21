import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, cartActions } from '../contexts/CartContext';

const Payment = () => {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { shippingAddress } = cartState;

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  const navigate = useNavigate();

  if (!shippingAddress.address) {
    navigate('/shipping');
  }

  const submitHandler = (e) => {
    e.preventDefault();
    cartActions.savePaymentMethod(paymentMethod)(cartDispatch);
    navigate('/placeorder');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-primary-900 mb-6 text-center">Payment Method</h1>
        <form onSubmit={submitHandler}>
          <div className="mb-6">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-primary-700 mb-2">
              Select Payment Method
            </label>
            <div className="flex items-center pl-4 border border-primary-300 rounded-lg py-3 px-4 hover:bg-primary-50">
              <input
                type="radio"
                id="razorpay"
                name="paymentMethod"
                value="Razorpay"
                checked={paymentMethod === 'Razorpay'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-primary-600 bg-primary-100 border-primary-300 focus:ring-primary-500 focus:ring-2"
              />
              <label htmlFor="razorpay" className="ml-2 text-sm font-medium text-primary-900">
                Razorpay
              </label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Continue to Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;