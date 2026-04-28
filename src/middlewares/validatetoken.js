import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export const authRequired = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const user = jwt.verify(token, TOKEN_SECRET);
    req.user = user;  
    
    console.log('Empleado ID:', req.user.empleadoId);

    next();  
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
