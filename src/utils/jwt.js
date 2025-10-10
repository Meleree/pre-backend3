// src/utils/jwt.js (FINAL)
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (user) => {
    // 🚨 CORRECCIÓN: Definimos el payload directamente, sin anidar en 'user'
    const payload = {
        _id: user._id || user.id, // Usamos _id para coincidir con la convención de Mongoose
        email: user.email,
        role: user.role || 'user'
    };
    // Firmamos el token con la clave secreta
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        throw err;
    }
};