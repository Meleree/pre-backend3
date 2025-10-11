import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Product from '../dao/models/product.model.js';
import Cart from '../dao/models/cart.model.js';
import User from '../dao/models/user.model.js'; 

dotenv.config();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ====================== MIDDLEWARE / HELPERS ======================

const getUserFromCookie = async (req) => {
    try {
        if (req.signedCookies.currentUser) {

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

router.get('/login', async (req, res) => {
    const user = await getUserFromCookie(req);
    if (user) return res.redirect('/'); 

    const error = req.query.error || null;
    const welcomeMessage = req.query.welcomeMessage || null;
    res.render('login', { error, title: 'Login', welcomeMessage });
});

router.get('/register', async (req, res) => {
    const user = await getUserFromCookie(req);
    if (user) return res.redirect('/');

    const error = req.query.error || null;
    res.render('register', { error, title: 'Registro' });
});

router.get('/logout', (req, res) => {
    res.clearCookie('currentUser'); 
    res.redirect('/login');
});

router.get(
    '/current',
    passport.authenticate('jwt', { session: false, failureRedirect: '/login' }), 
    (req, res) => {
        const user = req.user.toObject ? req.user.toObject() : req.user;
        res.render('current', { user, title: 'Perfil' });
    }
);

// ====================== VISTAS DE PRODUCTOS Y CARRITOS ======================

router.get('/', async (req, res) => {
    const user = await getUserFromCookie(req);
    const products = await Product.find().lean(); 
    const welcomeMessage = req.query.welcome && user ? `👋 ¡Bienvenida, ${user.first_name}!` : null;

    res.render('home', { title: 'Inicio', user, products, welcomeMessage });
});

router.get('/carts', async (req, res) => {
    const user = await getUserFromCookie(req);
    const carts = await Cart.find().populate('products.product').lean();
    res.render('carts', { title: 'Lista de Carritos', user, carts });
});

router.get('/carts/:cid', async (req, res) => {
    const user = await getUserFromCookie(req);
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();

    if (!cart) return res.status(404).render('error', { message: 'Carrito no encontrado', title: 'Error', user });

    res.render('cart', { cart, title: `Carrito ${cart._id}`, user });
});

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

router.get('/realtimeproducts', async (req, res) => {
    const user = await getUserFromCookie(req);
    const products = await Product.find().lean();
    res.render('realTimeProducts', { title: 'Productos en tiempo real', user, products });
});

export default router;