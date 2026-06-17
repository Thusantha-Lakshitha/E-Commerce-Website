import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey1234', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400);
      return next(new Error('Please provide name, email and password'));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return next(new Error('User already exists'));
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Send Welcome Email
      const emailSubject = 'Welcome to MERN Shop!';
      const emailText = `Hello ${user.name},\n\nWelcome to MERN Shop! We are excited to have you as part of our community.\n\nBest regards,\nMERN Shop Team`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Welcome to MERN Shop, ${user.name}!</h2>
          <p>We're thrilled to welcome you to our community. You can now browse our catalogue, save items to your wishlist, and make secure purchases.</p>
          <p>Start shopping now:</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Visit Our Store</a>
          <br/><br/>
          <p>Best regards,<br/><strong>MERN Shop Team</strong></p>
        </div>
      `;
      await sendEmail({ email: user.email, subject: emailSubject, text: emailText, html: emailHtml });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      return next(new Error('User with this email does not exist'));
    }

    // Generate short-lived reset token (15 mins)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secretkey1234',
      { expiresIn: '15m' }
    );

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const emailSubject = 'Password Reset Request';
    const emailText = `Hello ${user.name},\n\nYou requested a password reset. Please click on the link below to reset your password. This link is valid for 15 minutes:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. Please click the button below to set a new password. This link is valid for 15 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">If button doesn't work, copy and paste this URL into your browser:</p>
        <p style="color: #4F46E5; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <p>If you did not make this request, please ignore this email safely.</p>
        <br/>
        <p>Best regards,<br/><strong>MERN Shop Team</strong></p>
      </div>
    `;

    await sendEmail({ email: user.email, subject: emailSubject, text: emailText, html: emailHtml });

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      res.status(400);
      return next(new Error('Token and password are required'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey1234');
    } catch (err) {
      res.status(400);
      return next(new Error('Invalid or expired reset token'));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Assign new password, the pre-save hook will hash it automatically
    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};
