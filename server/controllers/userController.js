import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404);
      next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404);
      next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json(user.wishlist);
    } else {
      res.status(404);
      next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
export const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;

  try {
    if (!productId) {
      res.status(400);
      return next(new Error('Product ID required'));
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.wishlist.includes(productId)) {
      res.status(400);
      return next(new Error('Product already in wishlist'));
    }

    user.wishlist.push(productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  const productId = req.params.id;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (user) {
      const cartItems = user.cart.map(item => {
        if (!item.product) return null;
        return {
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0] || '',
          price: item.product.price,
          stock: item.product.stock,
          qty: item.qty
        };
      }).filter(Boolean);
      res.json(cartItems);
    } else {
      res.status(404);
      next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart or increase qty
// @route   POST /api/users/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  const { productId, qty } = req.body;
  const quantity = Number(qty) || 1;

  try {
    if (!productId) {
      res.status(400);
      return next(new Error('Product ID required'));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const existItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existItemIndex > -1) {
      user.cart[existItemIndex].qty += quantity;
    } else {
      user.cart.push({ product: productId, qty: quantity });
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    const cartItems = updatedUser.cart.map(item => {
      if (!item.product) return null;
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || '',
        price: item.product.price,
        stock: item.product.stock,
        qty: item.qty
      };
    }).filter(Boolean);
    
    res.json(cartItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/users/cart/:id
// @access  Private
export const updateCartQty = async (req, res, next) => {
  const productId = req.params.id;
  const { qty } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const existItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existItemIndex > -1) {
      user.cart[existItemIndex].qty = Number(qty);
      await user.save();
      
      const updatedUser = await User.findById(req.user._id).populate('cart.product');
      const cartItems = updatedUser.cart.map(item => {
        if (!item.product) return null;
        return {
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0] || '',
          price: item.product.price,
          stock: item.product.stock,
          qty: item.qty
        };
      }).filter(Boolean);
      
      res.json(cartItems);
    } else {
      res.status(404);
      next(new Error('Product not found in cart'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/users/cart/:id
// @access  Private
export const removeFromCart = async (req, res, next) => {
  const productId = req.params.id;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    const cartItems = updatedUser.cart.map(item => {
      if (!item.product) return null;
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || '',
        price: item.product.price,
        stock: item.product.stock,
        qty: item.qty
      };
    }).filter(Boolean);

    res.json(cartItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear user cart
// @route   DELETE /api/users/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.cart = [];
    await user.save();
    res.json([]);
  } catch (error) {
    next(error);
  }
};

