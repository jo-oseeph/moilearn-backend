import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes — any logged-in user
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next(); // logged in → continue
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

//Admin checker — must have role === 'admin'
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // user is admin → continue
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};
