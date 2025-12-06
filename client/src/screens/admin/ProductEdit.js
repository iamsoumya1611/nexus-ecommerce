import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getProductDetails, updateProduct, product, loading, error, successUpdate, errorUpdate, loadingUpdate } = useAdmin();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (successUpdate) {
      navigate('/admin/productlist');
    } else {
      if (!product.name || product._id !== id) {
        getProductDetails(id);
      } else {
        setName(product.name);
        setPrice(product.price);
        setImage(product.image);
        setBrand(product.brand);
        setCategory(product.category);
        setCountInStock(product.countInStock);
        setDescription(product.description);
      }
    }
  }, [getProductDetails, id, product, successUpdate, navigate]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    // In a real app, you would upload the file to your server
    // For now, we'll just simulate the upload
    setUploading(true);
    setTimeout(() => {
      setImage(URL.createObjectURL(file));
      setUploading(false);
    }, 1000);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    updateProduct({
      _id: id,
      name,
      price,
      image,
      brand,
      category,
      description,
      countInStock: parseInt(countInStock)
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/productlist" className="btn btn-light mb-4 inline-flex items-center">
        <i className="fas fa-arrow-left mr-2"></i>
        Go Back
      </Link>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 mb-6">Edit Product</h1>
        
        {loadingUpdate && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Updating product...
          </div>
        )}
        {errorUpdate && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorUpdate}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
        ) : (
          <div className="card p-6">
            <form onSubmit={submitHandler}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="form-input w-full"
                  id="name"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-primary-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  className="form-input w-full"
                  id="price"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-primary-700 mb-2">
                  Image
                </label>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img className="h-16 w-16 rounded-md object-cover" src={image} alt={name} />
                  </div>
                  <div className="flex-grow">
                    <input
                      type="text"
                      className="form-input w-full mb-2"
                      id="image"
                      placeholder="Enter image url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                    <input
                      type="file"
                      className="block w-full text-sm text-primary-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      onChange={uploadFileHandler}
                    />
                    {uploading && (
                      <div className="mt-2">
                        <LoadingSpinner size="sm" centered={false} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="brand" className="block text-sm font-medium text-primary-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  className="form-input w-full"
                  id="brand"
                  placeholder="Enter brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="countInStock" className="block text-sm font-medium text-primary-700 mb-2">
                  Count In Stock
                </label>
                <input
                  type="number"
                  className="form-input w-full"
                  id="countInStock"
                  placeholder="Enter count in stock"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-primary-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  className="form-input w-full"
                  id="category"
                  placeholder="Enter category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
                  Description
                </label>
                <textarea
                  className="form-input w-full"
                  id="description"
                  rows="3"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-primary w-full" disabled={loadingUpdate}>
                {loadingUpdate ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" centered={false} />
                    <span className="ml-2">Updating...</span>
                  </div>
                ) : (
                  'Update'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductEdit;
