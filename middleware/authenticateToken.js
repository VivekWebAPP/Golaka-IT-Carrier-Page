import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authenticateToken = (req, res, next) => {
  const token = req.header('Auth-Token' || 'auth-token');
  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

export default authenticateToken;
