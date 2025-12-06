import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProduct, productActions } from '../contexts/ProductContext';
import { useCart, cartActions } from '../contexts/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Product Screen Component
// This component displays detailed information about a single product
const Product = () => {
  // Get product ID from URL parameters
  const { id } = useParams();
  
  // Navigation hook for programmatic navigation
  const navigate = useNavigate();
  
  // Get product details and cart state from Context
  const { state: productState, dispatch: productDispatch } = useProduct();
  const { details: productDetails } = productState;
  const { loading, error, product } = productDetails;
  
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { cartItems } = cartState;
  
  // State for product quantity selection and review form
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Get product review creation state
  const { state: productCreateReviewState, dispatch: productCreateReviewDispatch } = useProduct();
  const { create: productCreateReview } = productCreateReviewState;
  const { success: successProductReview, error: errorProductReview } = productCreateReview;

  // useEffect hook to fetch product details when component mounts or when ID/Review changes
  useEffect(() => {
    productActions.listProductDetails(id)(productDispatch);
  }, [productDispatch, id, successProductReview]);

  // Handle adding product to cart
  const addToCartHandler = () => {
    cartActions.addToCart(id, qty)(cartDispatch);
    navigate('/cart'); // Redirect to cart page
  };

  // Handle form submission for product review
  const submitHandler = (e) => {
    e.preventDefault(); // Prevent default form submission
    productActions.createProductReview(id, { rating, comment })(productDispatch);
  };

  return (
    <>
      {/* Main container with padding */}
      <div className="container mx-auto px-4 py-8">
        {/* Back button to return to home page */}
        <Link className="btn btn-light mb-4 inline-flex items-center" to="/">
          <i className="fas fa-arrow-left mr-2"></i>
          Go Back
        </Link>
        
        {/* Loading and error handling */}
        {loading ? (
          // Show loading spinner while product details are being fetched
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          // Show error message if there was a problem fetching product details
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
        ) : (
          // Display product details
          <>
            {/* Product details grid - image on left, info on right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product image */}
              <div>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full rounded-lg shadow-lg" 
                />
              </div>
              
              {/* Product information */}
              <div>
                {/* Product name and rating */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary-900">{product.name}</h2>
                    <div className="rating mb-2">
                      <span>
                        {/* Display 5-star rating based on product rating */}
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          ></i>
                        ))}
                        <span className="text-primary-700 text-sm font-medium ml-2">
                          {product.numReviews} reviews
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Product price */}
                <div className="mb-6">
                  <strong className="text-3xl font-bold text-primary-800">
                    ₹{product.price}
                  </strong>
                </div>
                
                {/* Product description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Description</h3>
                  <p className="text-primary-700">{product.description}</p>
                </div>
                
                {/* Product meta information */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-primary-700">Category</h4>
                    <p className="text-primary-900">{product.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary-700">Brand</h4>
                    <p className="text-primary-900">{product.brand}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary-700">Stock</h4>
                    <p className={`font-medium ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out of Stock'}
                    </p>
                  </div>
                </div>
                
                {/* Add to cart section - only show if product is in stock */}
                {product.countInStock > 0 && (
                  <div className="border-t border-primary-200 pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <label htmlFor="qty" className="text-primary-900 font-medium">Qty</label>
                      <select
                        id="qty"
                        className="form-input"
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                      >
                        {/* Create options based on available stock */}
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={addToCartHandler}
                      className="btn btn-primary w-full"
                    >
                      <i className="fas fa-shopping-cart mr-2"></i>
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Reviews section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-primary-900 mb-6">Reviews</h3>
              
              {/* Review submission form - only shown to authenticated users */}
              {cartItems.some(item => item.product === id) ? (
                <div className="card p-6 mb-8">
                  <h4 className="text-xl font-semibold text-primary-900 mb-4">Write a Review</h4>
                  
                  {/* Show success message if review was submitted successfully */}
                  {successProductReview && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                      Review submitted successfully!
                    </div>
                  )}
                  
                  {/* Show error message if there was a problem submitting review */}
                  {errorProductReview && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {errorProductReview}
                    </div>
                  )}
                  
                  <form onSubmit={submitHandler}>
                    <div className="mb-4">
                      <label htmlFor="rating" className="block text-sm font-medium text-primary-700 mb-2">
                        Rating
                      </label>
                      <select
                        id="rating"
                        className="form-input"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        required
                      >
                        <option value="">Select...</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="comment" className="block text-sm font-medium text-primary-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        id="comment"
                        rows="3"
                        className="form-input w-full"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary">
                      Submit Review
                    </button>
                  </form>
                </div>
              ) : (
                <p className="text-primary-700 mb-8">
                  Please purchase this product to write a review.
                </p>
              )}
              
              {/* Display existing reviews */}
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review._id} className="card p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-lg font-semibold text-primary-900">{review.name}</h5>
                        <span className="text-sm text-primary-700">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="rating mb-3">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          ></i>
                        ))}
                      </div>
                      
                      <p className="text-primary-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-primary-700">No reviews yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Product;