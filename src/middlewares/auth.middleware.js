import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.signedCookies.currentUser; 

    if (!token) {
      return res.status(401).json({ message: "Tenés que iniciar sesión para acceder a este recurso." });
    }

    const decoded = jwt.verify(token, JWT_SECRET); 

    const normalizedUser = {
      _id: decoded._id || decoded.id, 
      email: decoded.email,
      role: decoded.role,
    };

    req.user = normalizedUser; 

    next();
  } catch (err) {
    console.error("Error al verificar token de cookie:", err.message);
    res.clearCookie('currentUser'); 
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const authorize = (roles) => (req, res, next) => {
  if (!req.user) {
    return authMiddleware(req, res, () => {
      if (!req.user) return; 

      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: `Acceso denegado: Se requiere uno de los roles: ${roles.join(', ')}.` });
      }
    });
  }

  if (roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: `Acceso denegado: Se requiere uno de los roles: ${roles.join(', ')}.` });
  }
};

export const authorizeRole = authorize;