import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  // Load cart items initially based on user status
  useEffect(() => {
    const loadCart = async () => {
      // Clean up legacy global cart key if it exists
      if (localStorage.getItem('cartItems')) {
        localStorage.removeItem('cartItems');
      }

      if (userInfo) {
        const userCartKey = `cartItems_${userInfo._id}`;
        const localUserCart = localStorage.getItem(userCartKey);
        if (localUserCart) {
          setCartItems(JSON.parse(localUserCart));
        } else {
          setCartItems([]);
        }

        try {
          const { data } = await api.get('/users/cart');
          setCartItems(data);
          localStorage.setItem(userCartKey, JSON.stringify(data));
        } catch (err) {
          console.error('Error fetching cart from backend:', err.message);
        }
      } else {
        const guestCart = localStorage.getItem('cartItems_guest');
        setCartItems(guestCart ? JSON.parse(guestCart) : []);
      }
    };

    loadCart();
  }, [userInfo]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    const key = userInfo ? `cartItems_${userInfo._id}` : 'cartItems_guest';
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, userInfo]);

  const addToCart = async (product, qty = 1) => {
    // 1. Update local state
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === product._id);

      if (existItem) {
        return prevItems.map((x) =>
          x.product === product._id
            ? { ...x, qty: Math.min(product.stock, x.qty + qty) }
            : x
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
            price: product.price,
            stock: product.stock,
            qty,
          },
        ];
      }
    });

    // 2. Sync to backend if logged in
    if (userInfo) {
      try {
        const { data } = await api.post('/users/cart', { productId: product._id, qty });
        setCartItems(data);
      } catch (err) {
        console.error('Error syncing add-to-cart to backend:', err.message);
      }
    }
  };

  const updateCartQty = async (productId, qty) => {
    // 1. Update local state
    setCartItems((prevItems) =>
      prevItems.map((x) => (x.product === productId ? { ...x, qty } : x))
    );

    // 2. Sync to backend if logged in
    if (userInfo) {
      try {
        const { data } = await api.put(`/users/cart/${productId}`, { qty });
        setCartItems(data);
      } catch (err) {
        console.error('Error syncing update-qty to backend:', err.message);
      }
    }
  };

  const removeFromCart = async (productId) => {
    // 1. Update local state
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== productId));

    // 2. Sync to backend if logged in
    if (userInfo) {
      try {
        const { data } = await api.delete(`/users/cart/${productId}`);
        setCartItems(data);
      } catch (err) {
        console.error('Error syncing remove-item to backend:', err.message);
      }
    }
  };

  const clearCart = async () => {
    // 1. Update local state
    setCartItems([]);

    // 2. Sync to backend if logged in
    if (userInfo) {
      try {
        await api.delete('/users/cart');
      } catch (err) {
        console.error('Error syncing clear-cart to backend:', err.message);
      }
    }
  };

  // Helper calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
  const taxPrice = itemsPrice * 0.15; // 15% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
