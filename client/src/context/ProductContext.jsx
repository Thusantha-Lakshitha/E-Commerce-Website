import React, { createContext, useState } from 'react';
import api from '../utils/api';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setCategories(data.categories || []);
      setPages(data.pages || 1);
      setPage(data.page || 1);
      setTotalProducts(data.totalProducts || 0);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchProductDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/products/${id}`);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message;
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const submitReview = async (productId, rating, comment) => {
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, {
        rating,
        comment,
      });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        pages,
        page,
        totalProducts,
        fetchProducts,
        fetchProductDetails,
        submitReview,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
