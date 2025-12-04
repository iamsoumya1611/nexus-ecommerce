import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin, adminActions } from '../../contexts/AdminContext';
import { useProduct, productActions } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';

const ProductList = () => {
  const { state: adminState, dispatch: adminDispatch } = useAdmin();
  const { productList: adminProductList } = adminState;
  const { loading, error, products } = adminProductList;

  const { state: productState, dispatch: productDispatch } = useProduct();
  const { delete: productDelete } = productState;
  const { success: successDelete } = productDelete;

  const { user: userInfo } = useAuth();

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      adminActions.listProducts()(adminDispatch);
    }
  }, [adminDispatch, userInfo, successDelete]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      productActions.deleteProduct(id)(productDispatch);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-900">Products</h1>
        <Link 
          to="/admin/product/create" 
          className="btn btn-primary flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Create Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          {error}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200">
              <thead className="bg-primary-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    NAME
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    PRICE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    CATEGORY
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    BRAND
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-primary-700 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-primary-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {product._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/product/${product._id}/edit`}
                        className="btn btn-light mr-2"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteHandler(product._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;