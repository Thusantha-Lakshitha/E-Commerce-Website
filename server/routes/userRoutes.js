import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.delete('/wishlist/:id', protect, removeFromWishlist);

router
  .route('/cart')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router
  .route('/cart/:id')
  .put(protect, updateCartQty)
  .delete(protect, removeFromCart);

export default router;
