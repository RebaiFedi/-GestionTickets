const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    req.user = user;
    
    if (user.role === 'store') {
      const store = await Store.findOne({ user: user._id });
      if (store) {
        req.user.store = store._id;
      }
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
