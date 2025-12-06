import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is already logged in (from localStorage)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Verify token is still valid
                if (parsedUser.token) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Failed to parse user data from localStorage', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            // Use proxy path in development, full URL in production
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL || '';
            const finalUrl = `${baseUrl.replace(/\/$/, '')}/users/login`;
                
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const { data } = await axios.post(finalUrl, { email, password }, config);
            
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success('Login successful');
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            // Use proxy path in development, full URL in production
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL || '';
            const finalUrl = `${baseUrl.replace(/\/$/, '')}/users/register`;
                
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const { data } = await axios.post(finalUrl, { name, email, password }, config);
            
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success('Registration successful');
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        toast.success('Logout successful');
    };

    const getUserProfile = async () => {
        try {
            if (!user || !user.token) {
                toast.error('Not authenticated');
                return { success: false, error: 'Not authenticated' };
            }
            
            setLoading(true);
            setError(null);
            
            // Use proxy path in development, full URL in production
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL || '';
            const finalUrl = `${baseUrl.replace(/\/$/, '')}/users/profile`;
                
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.get(finalUrl, config);
            
            // Update user data with fresh profile info
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateUserProfile = async (userData) => {
        try {
            if (!user || !user.token) {
                return { success: false, error: 'Not authenticated' };
            }
            
            setLoading(true);
            setError(null);
            
            // Use proxy path in development, full URL in production
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL || '';
            const finalUrl = `${baseUrl.replace(/\/$/, '')}/users/profile`;
                
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.put(finalUrl, userData, config);
            
            // Update user data with updated profile info
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            return { success: true, data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            toast.error(errorMessage);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            userInfo: user,  // Alias for backward compatibility
            login, 
            logout, 
            loading, 
            error,
            register,
            getUserProfile,
            updateUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};