// src/routes/views.router.js
import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Product from '../dao/models/product.model.js';
import Cart from '../dao/models/cart.model.js';
import User from '../dao/models/user.model.js'; 

dotenv.config();
const router = Router();
// 🚨 CRÍTICO: Leer la clave inmediatamente para usarla en el helper
const JWT_SECRET = process.env.JWT_SECRET;

// ====================== MIDDLEWARE / HELPERS ======================

// Helper para obtener el usuario desde la cookie JWT y mostrar la sesión
const getUserFromCookie = async (req) => {
    try {
        if (req.signedCookies.currentUser) {
            // Usa la constante JWT_SECRET
            const decoded = jwt.verify(req.signedCookies.currentUser, JWT_SECRET); 
            
            const userId = decoded._id || decoded.id || (decoded.user && decoded.user.id);

            if (userId) {
                const dbUser = await User.findById(userId).lean(); 
                if (dbUser) {
                    return {
                        _id: dbUser._id,
                        first_name: dbUser.first_name,
                        last_name: dbUser.last_name,
                        email: dbUser.email,
                        role: dbUser.role,
                        cart: dbUser.cart, 
                    };
                }
            }
        }
    } catch (err) {
        if (req.signedCookies.currentUser) {
            console.warn("Token inválido/expirado en vista, se ignora.");
        }
    }
    return null;
};

// ====================== VISTAS DE AUTENTICACIÓN ======================

// Vista login (GET /login)
router.get('/login', async (req, res) => {
    const user = await getUserFromCookie(req);
    if (user) return res.redirect('/'); 
    
    const error = req.query.error || null;
    const welcomeMessage = req.query.welcomeMessage || null;
    res.render('login', { error, title: 'Login', welcomeMessage });
});

// Vista register (GET /register)
router.get('/register', async (req, res) => {
    const user = await getUserFromCookie(req);
    if (user) return res.redirect('/');
    
    const error = req.query.error || null;
    res.render('register', { error, title: 'Registro' });
});

// Logout (GET /logout) - Limpieza de cookie
router.get('/logout', (req, res) => {
    res.clearCookie('currentUser'); // Limpiamos la cookie
    res.redirect('/login');        // Redirigimos al login
});

// Vista perfil (GET /current)
router.get(
    '/current',
    passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), 
    (req, res) => {
        const user = req.user.toObject ? req.user.toObject() : req.user;
        res.render('current', { user, title: 'Perfil' });
    }
);

// ====================== VISTAS DE PRODUCTOS Y CARRITOS ======================

// Home (GET /)
router.get('/', async (req, res) => {
    const user = await getUserFromCookie(req);
    const products = await Product.find().lean(); 
    const welcomeMessage = req.query.welcome && user ? `👋 ¡Bienvenida, ${user.first_name}!` : null;

    res.render('home', { title: 'Inicio', user, products, welcomeMessage });
});

// Lista de Carritos (GET /carts)
router.get('/carts', async (req, res) => {
    const user = await getUserFromCookie(req);
    const carts = await Cart.find().populate('products.product').lean();
    res.render('carts', { title: 'Lista de Carritos', user, carts });
});

// Detalle de Carrito (GET /carts/:cid)
router.get('/carts/:cid', async (req, res) => {
    const user = await getUserFromCookie(req);
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();

    if (!cart) return res.status(404).render('error', { message: 'Carrito no encontrado', title: 'Error', user });

    res.render('cart', { cart, title: `Carrito ${cart._id}`, user });
});

// Detalle de Producto (GET /products/:pid)
router.get('/products/:pid', async (req, res) => {
    const user = await getUserFromCookie(req);
    try {
        const product = await Product.findById(req.params.pid).lean();
        if (!product) return res.status(404).render('error', { message: 'Producto no encontrado', title: 'Error', user });

        product.thumbnail = product.thumbnail || (product.thumbnails && product.thumbnails[0]) || '/img/default-placeholder.png';
        res.render('productDetail', { product, title: product.title, user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error al cargar el producto', title: 'Error', user });
    }
});

// Productos en tiempo real (GET /realtimeproducts)
router.get('/realtimeproducts', async (req, res) => {
    const user = await getUserFromCookie(req);
    const products = await Product.find().lean();
    res.render('realTimeProducts', { title: 'Productos en tiempo real', user, products });
});

export default router;