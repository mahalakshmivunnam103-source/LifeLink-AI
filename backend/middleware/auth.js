const jwt = require('jsonwebtoken');
const dataStore = require('../services/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'lifelink_ai_dev_secret_jwt_key_replace_me_123456789';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dataStore.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: User record no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account disabled. Please contact platform administrators.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please log in again.',
    });
  }
};

module.exports = { authenticateToken };
