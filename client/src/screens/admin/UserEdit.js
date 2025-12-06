import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getUserDetails, updateUser, user, loading, error, successUpdate, errorUpdate, loadingUpdate } = useAdmin();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (successUpdate) {
      navigate('/admin/userlist');
    } else {
      if (!user.name || user._id !== id) {
        getUserDetails(id);
      } else {
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.isAdmin);
      }
    }
  }, [getUserDetails, id, user, successUpdate, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    updateUser({ _id: id, name, email, isAdmin });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/userlist" className="btn btn-light mb-4 inline-flex items-center">
        <i className="fas fa-arrow-left mr-2"></i>
        Go Back
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 mb-6">Edit User</h1>
        
        {loadingUpdate && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Updating user...
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
                <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input w-full"
                  id="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary-600"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-primary-700">
                  Is Admin
                </label>
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

export default UserEdit;