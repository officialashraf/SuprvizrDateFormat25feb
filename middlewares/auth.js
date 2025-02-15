import jwt from 'jsonwebtoken';
import dotenv from "dotenv"
dotenv.config();

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.headers['authorization'];
        
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
      // Remove "Bearer " prefix if present
      const actualToken = token.split(' ')[1];
      console.log('Token Received:', actualToken);

      // Verify token
      const decoded = jwt.verify(actualToken, process.env.SECRET_KEY); // Secret key must match
      console.log('Decoded Token:', decoded);

      req.user = decoded; // Attach decoded payload to request

      // Role Authorization
      if (!allowedRoles.includes(decoded.userRole)) {
        console.log('Role mismatch:', decoded.userRole);
        return res.status(403).json({ message: 'Forbidden: You do not have permission' });
      }

      console.log('User authorized:', decoded.userRole);
      next(); // Proceed to next middleware/route
    } catch (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
  };
};


