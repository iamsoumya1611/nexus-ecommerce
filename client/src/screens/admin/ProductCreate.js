import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { createProduct } from '../../actions/productActions';
import { PRODUCT_CREATE_RESET } from '../../constants/productConstants';
import axios from 'axios';

const ProductCreate = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('');
  const [color, setColor] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState('');
  const [gender, setGender] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [pages, setPages] = useState(0);
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productCreate = useSelector((state) => state.productCreate);
  const { loading, error, success } = productCreate;

  useEffect(() => {
    if (success) {
      dispatch({ type: PRODUCT_CREATE_RESET });
      navigate('/admin/productlist');
    }
  }, [dispatch, navigate, success]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };

        // Set base URL for axios
        const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
        
        const { data } = await axios.post(`${API_BASE_URL}/upload`, { image: base64Image }, config);
        
        setImage(data.url);
        setUploading(false);
      };
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProduct({
        name,
        price,
        image,
        brand,
        category,
        description,
        countInStock,
        model,
        storage,
        color,
        screenSize,
        size,
        material,
        gender,
        author,
        publisher,
        pages,
        weight,
        dimensions
      })
    );
  };

  // Categories for the dropdown
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Sports',
    'Books',
    'Beauty'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/productlist" className="btn btn-light mb-4 inline-flex items-center">
        <i className="fas fa-arrow-left mr-2"></i>
        Go Back
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 mb-6">Create Product</h1>
        
        {loading && (
          <div className="alert alert-info mb-4">
            Creating product...
          </div>
        )}
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}
        
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
              {/* <label htmlFor="image" className="block text-sm font-medium text-primary-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                className="form-input w-full mb-2"
                id="image"
                placeholder="Enter image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              /> */}
              <div className="mt-2">
                <input
                  type="file"
                  className="form-input w-full"
                  onChange={uploadFileHandler}
                  disabled={uploading}
                />
                {uploading && <div>Uploading...</div>}
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
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-primary-700 mb-2">
                Category
              </label>
              <select
                className="form-input w-full"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
                Description
              </label>
              <textarea
                className="form-input w-full"
                id="description"
                rows="4"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            
            {/* Category-specific fields */}
            {category === 'Electronics' && (
              <>
                <div className="mb-4">
                  <label htmlFor="model" className="block text-sm font-medium text-primary-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="model"
                    placeholder="Enter model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="storage" className="block text-sm font-medium text-primary-700 mb-2">
                    Storage
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="storage"
                    placeholder="Enter storage"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="color" className="block text-sm font-medium text-primary-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="color"
                    placeholder="Enter color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="screenSize" className="block text-sm font-medium text-primary-700 mb-2">
                    Screen Size
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="screenSize"
                    placeholder="Enter screen size"
                    value={screenSize}
                    onChange={(e) => setScreenSize(e.target.value)}
                  />
                </div>
              </>
            )}
            
            {category === 'Fashion' && (
              <>
                <div className="mb-4">
                  <label htmlFor="size" className="block text-sm font-medium text-primary-700 mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="size"
                    placeholder="Enter size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="material" className="block text-sm font-medium text-primary-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="material"
                    placeholder="Enter material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="gender" className="block text-sm font-medium text-primary-700 mb-2">
                    Gender
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="gender"
                    placeholder="Enter gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
              </>
            )}
            
            {category === 'Books' && (
              <>
                <div className="mb-4">
                  <label htmlFor="author" className="block text-sm font-medium text-primary-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="author"
                    placeholder="Enter author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="publisher" className="block text-sm font-medium text-primary-700 mb-2">
                    Publisher
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="publisher"
                    placeholder="Enter publisher"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="pages" className="block text-sm font-medium text-primary-700 mb-2">
                    Pages
                  </label>
                  <input
                    type="number"
                    className="form-input w-full"
                    id="pages"
                    placeholder="Enter number of pages"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                  />
                </div>
              </>
            )}
            
            {(category === 'Home & Kitchen' || category === 'Sports' || category === 'Beauty') && (
              <>
                <div className="mb-4">
                  <label htmlFor="weight" className="block text-sm font-medium text-primary-700 mb-2">
                    Weight
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="weight"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="dimensions" className="block text-sm font-medium text-primary-700 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    id="dimensions"
                    placeholder="Enter dimensions"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;