// src/middlewares/auth.middleware.js (FINAL)
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar la sesión activa (AUTENTICACIÓN)
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.signedCookies.currentUser; 

    if (!token) {
        return res.status(401).json({ message: "Tenés que iniciar sesión para acceder a este recurso." });
    }

    // VERIFICAR TOKEN
    const decoded = jwt.verify(token, JWT_SECRET); 
    
    // 🚨 CORRECCIÓN: Como el token ahora NO está anidado, la normalización es simple
    const normalizedUser = {
        _id: decoded._id || decoded.id, 
        email: decoded.email,
        role: decoded.role,
    };

    req.user = normalizedUser; // Adjunta el payload normalizado
    
    next();
  } catch (err) {
    console.error("Error al verificar token de cookie:", err.message);
    res.clearCookie('currentUser'); 
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware para autorizar roles específicos (AUTORIZACIÓN)
export const authorize = (roles) => (req, res, next) => {
    // Si req.user no existe, ejecutamos authMiddleware primero.
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

    // Si ya estamos autenticados (req.user existe), solo verificamos el rol.
    if (roles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: `Acceso denegado: Se requiere uno de los roles: ${roles.join(', ')}.` });
    }
};

export const authorizeRole = authorize;