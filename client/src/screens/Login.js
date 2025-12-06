import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { userInfo, loading, error, login } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="card p-8">
          <img src="/Nexus_logo.png" alt="Logo" className="mx-auto h-12 mb-4" />
          <h2 className="text-2xl font-bold text-center text-primary-900 mb-6">Welcome Back</h2>
          {loading && (
            <div className="flex justify-center my-4">
              <LoadingSpinner size="sm" />
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={submitHandler}>
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
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-2">
                Password
              </label>
              <input
                type="password"
                className="form-input w-full"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center">
              <p className="text-primary-700">
                New Customer?{' '}
                <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-primary-600 hover:text-primary-800 font-medium">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;