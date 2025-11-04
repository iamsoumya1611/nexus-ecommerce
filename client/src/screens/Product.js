import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { listProductDetails, createProductReview } from '../actions/productActions';
import { addToCart } from '../actions/cartActions';

const Product = () => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id } = useParams();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productCreateReview = useSelector((state) => state.productCreateReview);
  const { success: successProductReview, error: errorProductReview } = productCreateReview;

  useEffect(() => {
    dispatch(listProductDetails(id));
  }, [dispatch, id, successProductReview]);

  const addToCartHandler = () => {
    dispatch(addToCart(id, qty));
    navigate('/cart');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(createProductReview(id, { rating, comment }));
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Link className="btn btn-light mb-4 inline-flex items-center" to="/">
          <i className="fas fa-arrow-left mr-2"></i>
          Go Back
        </Link>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full rounded-lg shadow-lg" 
                />
              </div>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-brown-900">{product.name}</h2>
                    <div className="rating mb-2">
                      <span>
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < Math.floor(product.rating) ? 'active' : 'inactive'}`}
                          ></i>
                        ))}
                      </span>
                      <span className="text-brown-700 text-sm ml-2">({product.numReviews} reviews)</span>
                    </div>
                  </div>
                  <h3 className="price text-2xl">₹{product.price}</h3>
                </div>
                <p className="text-brown-700 mb-4">{product.description}</p>
                <div className="mb-4">
                  <span className="inline-block bg-brown-100 text-brown-800 text-sm px-3 py-1 rounded-full mr-2">
                    Brand: {product.brand}
                  </span>
                  <span className="inline-block bg-brown-100 text-brown-800 text-sm px-3 py-1 rounded-full">
                    Category: {product.category}
                  </span>
                </div>
                <div className="mb-6">
                  <h5 className="font-medium text-brown-900">
                    Status: 
                    <span className={`ml-2 ${product.countInStock > 0 ? 'text-success-700' : 'text-error-700'}`}>
                      {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </h5>
                </div>
                {product.countInStock > 0 && (
                  <div className="card p-6">
                    <h5 className="text-lg font-semibold mb-4">Add to Cart</h5>
                    <div className="mb-4">
                      <label htmlFor="qty" className="block text-sm font-medium text-brown-700 mb-2">
                        Quantity
                      </label>
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
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-brown-900 mb-6">Reviews</h3>
              {product.reviews && product.reviews.length === 0 && (
                <div className="alert alert-info">No reviews yet</div>
              )}
              <div className="space-y-4">
                {product.reviews && product.reviews.map((review) => (
                  <div key={review._id} className="card p-4">
                    <div className="flex justify-between">
                      <h6 className="font-semibold text-brown-900">{review.name}</h6>
                      <span className="text-sm text-brown-700">
                        {review.createdAt.substring(0, 10)}
                      </span>
                    </div>
                    <div className="rating my-2">
                      <span>
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star ${i < review.rating ? 'active' : 'inactive'}`}
                          ></i>
                        ))}
                      </span>
                    </div>
                    <p className="text-brown-700">{review.comment}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h4 className="text-xl font-bold text-brown-900 mb-4">Write a Customer Review</h4>
                {errorProductReview && (
                  <div className="alert alert-danger" role="alert">
                    {errorProductReview}
                  </div>
                )}
                {successProductReview && (
                  <div className="alert alert-success" role="alert">
                    Review submitted successfully
                  </div>
                )}
                {userInfo ? (
                  <form onSubmit={submitHandler} className="card p-6">
                    <div className="mb-4">
                      <label htmlFor="rating" className="block text-sm font-medium text-brown-700 mb-2">
                        Rating
                      </label>
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
                      <label htmlFor="comment" className="block text-sm font-medium text-brown-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        id="comment"
                        className="form-input w-full"
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <div className="alert alert-info">
                    Please <Link to="/login" className="text-brown-700 font-medium">sign in</Link> to write a review
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