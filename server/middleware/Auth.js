// middleware/auth.js

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

const authenticateToken = (req, res, next) => {
  // const authHeader = req.headers['authorization'];
  const token = req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
};
