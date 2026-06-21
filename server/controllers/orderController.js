import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_keys_123');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentResult,
  } = req.body;

  try {
    if (orderItems && orderItems.length === 0) {
      res.status(400);
      return next(new Error('No order items'));
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentResult ? true : false,
      paidAt: paymentResult ? Date.now() : undefined,
      paymentResult,
    });

    const createdOrder = await order.save();

    // Update product stocks
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    }

    // Send Order Confirmation Email
    const emailSubject = `Order Confirmation #${createdOrder._id}`;
    const emailText = `Hello ${req.user.name},\n\nThank you for shopping with us! We have received your order.\n\nOrder Total: $${totalPrice}\nWe will notify you once your order is shipped.\n\nBest regards,\nLuxZone Shop Team`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Thank You for Your Order!</h2>
        <p>Hello ${req.user.name},</p>
        <p>We've received your order and are processing it. Below are the order details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p><strong>Order ID:</strong> ${createdOrder._id}</p>
          <p><strong>Total Amount:</strong> $${totalPrice.toFixed(2)}</p>
          <p><strong>Payment Status:</strong> ${createdOrder.isPaid ? 'Paid via Card' : 'Pending'}</p>
        </div>
        <p>You can view your order status in your profile dashboard at any time.</p>
        <br/>
        <p>Best regards,<br/><strong>LuxZone Shop Team</strong></p>
      </div>
    `;
    await sendEmail({ email: req.user.email, subject: emailSubject, text: emailText, html: emailHtml });

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Allow only the order owner or admin to view
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        return next(new Error('Not authorized to view this order'));
      }
      res.json(order);
    } else {
      res.status(404);
      next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status to paid (Stripe callback manually if not webhooked)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe payment intent
// @route   POST /api/orders/payment-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  const { amount } = req.body;

  try {
    if (!amount || isNaN(amount)) {
      res.status(400);
      return next(new Error('Valid payment amount required'));
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock')) {
      // Mock flow if no Stripe key is configured
      console.log('Stripe secret key not set. Generating mock payment client secret.');
      return res.json({
        clientSecret: `mock_secret_intent_${Math.random().toString(36).substring(7)}`,
        isMock: true,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // in cents
      currency: 'usd',
      metadata: { user_id: req.user._id.toString() },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      isMock: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics (Admin)
// @route   GET /api/orders/stats/dashboard
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    // 1. Total sales (Paid orders)
    const paidOrders = await Order.find({ isPaid: true });
    const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    // 2. Counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});

    // 3. Low stock items (stock <= 5)
    const lowStockAlerts = await Product.find({ stock: { $lte: 5 } }).select('name stock price');

    // 4. Monthly revenue calculation for past 6 months
    const monthlyRevenue = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group paid orders by month-year
    const revenueMap = {};
    paidOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      revenueMap[key] = (revenueMap[key] || 0) + order.totalPrice;
    });

    // Generate recent 6 months labels & values
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevenue.push({
        month: key,
        revenue: parseFloat((revenueMap[key] || 0).toFixed(2)),
      });
    }

    // 5. Best selling products (top 5 based on order quantities)
    const allOrders = await Order.find({ isPaid: true });
    const productSalesMap = {};

    allOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const prodId = item.product.toString();
        productSalesMap[prodId] = (productSalesMap[prodId] || 0) + item.qty;
      });
    });

    const sortedProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const bestSellers = [];
    for (const [prodId, qty] of sortedProducts) {
      const product = await Product.findById(prodId).select('name price category images');
      if (product) {
        bestSellers.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.images[0] || '',
          unitsSold: qty,
        });
      }
    }

    // 6. Category product counts distribution
    const categoriesGroup = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const categoryDistribution = categoriesGroup.map((c) => ({
      category: c._id || 'General',
      count: c.count,
    }));

    res.json({
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalUsers,
      totalOrders,
      totalProducts,
      lowStockCount: lowStockAlerts.length,
      lowStockAlerts,
      monthlyRevenue,
      bestSellers,
      categoryDistribution,
    });
  } catch (error) {
    next(error);
  }
};
