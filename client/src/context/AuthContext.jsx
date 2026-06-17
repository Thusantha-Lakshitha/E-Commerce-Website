import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null
  );
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (userInfo) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [userInfo]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message;
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message;
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUserInfo(null);
    setWishlist([]);
    localStorage.removeItem('userInfo');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put('/users/profile', profileData);
      const updatedUserInfo = { ...userInfo, ...data };
      setUserInfo(updatedUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message;
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/users/wishlist');
      setWishlist(data);
    } catch (err) {
      console.error('Error fetching wishlist:', err.message);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!userInfo) {
      throw new Error('You must be logged in to modify wishlist');
    }
    const isWishlisted = wishlist.some((item) => item._id === productId || item === productId);
    try {
      if (isWishlisted) {
        const { data } = await api.delete(`/users/wishlist/${productId}`);
        setWishlist(data);
      } else {
        const { data } = await api.post('/users/wishlist', { productId });
        setWishlist(data);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err.message);
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        wishlist,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
