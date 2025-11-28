import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';

const UserEdit = () => {
  const { id } = useParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState(null);
  const [errorUpdate, setErrorUpdate] = useState(null);
  const [successUpdate, setSuccessUpdate] = useState(false);
  const [user, setUser] = useState({});

  const { userInfo } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (successUpdate) {
      navigate('/admin/userlist');
    } else {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`
            }
          };

          // Use proxy path in development, full URL in production
          const finalUrl = process.env.NODE_ENV === 'development' 
            ? `/users/${id}` 
            : `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/users/${id}`;

          const { data } = await axios.get(finalUrl, config);
          setUser(data);
          setName(data.name);
          setEmail(data.email);
          setIsAdmin(data.isAdmin);
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Error fetching user');
        } finally {
          setLoading(false);
        }
      };

      if (!user.name || user._id !== id) {
        fetchUser();
      } else {
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.isAdmin);
      }
    }
  }, [navigate, user, id, successUpdate, userInfo.token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoadingUpdate(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      // Use proxy path in development, full URL in production
      const finalUrl = process.env.NODE_ENV === 'development' 
        ? `/users/${id}` 
        : `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/users/${id}`;

      const { data } = await axios.put(finalUrl, { name, email, isAdmin }, config);
      
      setUser(data);
      setSuccessUpdate(true);
    } catch (err) {
      setErrorUpdate(err.response?.data?.message || err.message || 'Error updating user');
    } finally {
      setLoadingUpdate(false);
    }
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-primary-300 text-primary-500 focus:ring-primary-500"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-primary-700">Is Admin</span>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loadingUpdate}
              >
                {loadingUpdate ? 'Updating...' : 'Update User'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEdit;