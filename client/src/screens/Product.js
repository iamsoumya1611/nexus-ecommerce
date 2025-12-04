import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProduct, productActions } from '../contexts/ProductContext';
import { useCart, cartActions } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Product Screen Component
// This component displays detailed information about a single product
const Product = () => {
  // State variables for form inputs
  const [qty, setQty] = useState(1);              // Quantity selector
  const [rating, setRating] = useState(0);        // Review rating
  const [comment, setComment] = useState('');     // Review comment

  // Navigation function to redirect users
  const navigate = useNavigate();

  // Get product ID from URL parameters
  const { id } = useParams();

  // Get product details state from Context
  const { state: productState, dispatch: productDispatch } = useProduct();
  const { details: productDetails, createReview: productCreateReview } = productState;
  const { loading, error, product } = productDetails;

  // Get user login state from Context
  const { user: userInfo } = useAuth();

  // Get cart state from Context
  const { dispatch: cartDispatch } = useCart();

  // Get product review creation state from Context
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
                            className={`fas fa-star ${i < Math.floor(product.rating) ? 'active' : 'inactive'}`}
                          ></i>
                        ))}
                      </span>
                      <span className="text-primary-700 text-sm ml-2">({product.numReviews} reviews)</span>
                    </div>
                  </div>
                  {/* Product price */}
                  <h3 className="price text-2xl">₹{product.price}</h3>
                </div>
                
                {/* Product description */}
                <p className="text-primary-700 mb-4">{product.description}</p>
                
                {/* Product brand and category */}
                <div className="mb-4">
                  <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full mr-2">
                    Brand: {product.brand}
                  </span>
                  <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                    Category: {product.category}
                  </span>
                </div>
                
                {/* Stock status */}
                <div className="mb-6">
                  <h5 className="font-medium text-primary-900">
                    Status: 
                    <span className={`ml-2 ${product.countInStock > 0 ? 'text-success-700' : 'text-error-700'}`}>
                      {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </h5>
                </div>
                
                {/* Add to cart section - only shown if product is in stock */}
                {product.countInStock > 0 && (
                  <div className="card p-6">
                    <h5 className="text-lg font-semibold mb-4">Add to Cart</h5>
                    <div className="mb-4">
                      <label htmlFor="qty" className="block text-sm font-medium text-primary-700 mb-2">
                        Quantity
                      </label>
                      {/* Quantity selector - options based on available stock */}
                      <select
                        id="qty"
                        className="form-input w-full"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                      >
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Add to cart button */}
                    <button
                      onClick={addToCartHandler}
                      className="btn btn-primary w-full flex items-center justify-center"
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
              
              {/* Message if no reviews exist */}
              {product.reviews && product.reviews.length === 0 && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">No reviews yet</div>
              )}
              
              {/* Display existing reviews */}
              <div className="space-y-4">
                {product.reviews && product.reviews.map((review) => (
                  <div key={review._id} className="card p-4">
                    <div className="flex justify-between">
                      <h6 className="font-semibold text-primary-900">{review.name}</h6>
                      <span className="text-sm text-primary-700">
                        {review.createdAt.substring(0, 10)}
                      </span>
                    </div>
                    <div className="rating my-2">
                      <span>
                        {/* Display 5-star rating for each review */}
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < review.rating ? 'active' : 'inactive'}`}
                          ></i>
                        ))}
                      </span>
                    </div>
                    <p className="text-primary-700">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              {/* Review submission form */}
              <div className="mt-8">
                <h4 className="text-xl font-bold text-primary-900 mb-4">Write a Customer Review</h4>
                
                {/* Error message if review submission failed */}
                {errorProductReview && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                    {errorProductReview}
                  </div>
                )}
                
                {/* Success message if review was submitted successfully */}
                {successProductReview && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
                    Review submitted successfully
                  </div>
                )}
                
                {/* Review form - only shown if user is logged in */}
                {userInfo ? (
                  <form onSubmit={submitHandler} className="card p-6">
                    <div className="mb-4">
                      <label htmlFor="rating" className="block text-sm font-medium text-primary-700 mb-2">
                        Rating
                      </label>
                      {/* Rating selector */}
                      <select
                        id="rating"
                        className="form-input w-full"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
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
                      {/* Comment text area */}
                      <textarea
                        id="comment"
                        className="form-input w-full"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    {/* Submit review button */}
                    <button type="submit" className="btn btn-primary">
                      Submit Review
                    </button>
                  </form>
                ) : (
                  // Message for non-logged in users
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                    Please <Link to="/login" className="text-primary-700 font-medium">sign in</Link> to write a review
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Product;