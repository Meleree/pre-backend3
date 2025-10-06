import { Router } from 'express';
import passport from 'passport';
import { verifyToken, signToken } from '../utils/jwt.js';
import Product from '../dao/models/product.model.js';
import Cart from '../dao/models/cart.model.js';
import User from '../dao/models/user.model.js';
import UserDTO from '../dto/user.dto.js';
import * as AuthService from '../services/auth.service.js';
import TicketService from '../services/ticket.service.js';
import { authorize } from '../middlewares/authorize.js';
import bcrypt from 'bcrypt';

const router = Router();
const ticketService = new TicketService();

// ====================== HELPERS ======================
const getUserFromCookie = async (req) => {
  try {
    if (req.signedCookies.currentUser) {
      const decoded = verifyToken(req.signedCookies.currentUser);
      if (decoded && decoded._id) {
        const dbUser = await User.findById(decoded._id).lean();
        if (dbUser) {
          return {
            _id: dbUser._id,
            first_name: dbUser.first_name,
            last_name: dbUser.last_name,
            email: dbUser.email,
            role: dbUser.role,
          };
        }
      }
    }
  } catch (err) {
    console.error("Error al obtener usuario desde cookie:", err);
  }
  return null;
};

// ====================== LOGIN / REGISTER ======================

// Vista login
router.get('/login', (req, res) => {
  const error = req.query.error || null;
  const welcomeMessage = req.query.welcomeMessage || null;
  res.render('login', { error, title: 'Login', welcomeMessage });
});

// Vista register
router.get('/register', (req, res) => {
  const error = req.query.error || null;
  res.render('register', { error, title: 'Registro' });
});

// Registro
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, age } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.render('register', { error: true });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      age,
      role: 'user'
    });

    const token = signToken({ _id: newUser._id, email: newUser.email, role: newUser.role });
    res.cookie('currentUser', token, { signed: true, httpOnly: true });

    const products = await Product.find().lean();
    res.render('home', { 
      title: 'Inicio', 
      user: { _id: newUser._id, first_name: newUser.first_name, last_name: newUser.last_name, role: newUser.role }, 
      products, 
      welcomeMessage: `👋 ¡Bienvenida, ${newUser.first_name}!`
    });

  } catch (err) {
    console.error('Error en /register:', err);
    res.render('register', { error: true });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: true });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.render('login', { error: true });

    const token = signToken({ _id: user._id, email: user.email, role: user.role });
    res.cookie('currentUser', token, { signed: true, httpOnly: true });

    const products = await Product.find().lean();
    res.render('home', { 
      title: 'Inicio', 
      user: { _id: user._id, first_name: user.first_name, last_name: user.last_name, role: user.role }, 
      products, 
      welcomeMessage: `👋 ¡Bienvenida, ${user.first_name}!`
    });

  } catch (err) {
    console.error('Error en /login:', err);
    res.render('login', { error: true });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('currentUser');
  res.redirect('/login');
});

// ====================== PERFIL / CURRENT ======================

router.get(
  '/current',
  passport.authenticate('jwt', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const userDto = new UserDTO(req.user);
    res.render('current', { user: userDto, title: 'Perfil' });
  }
);

// ====================== HOME / DASHBOARD ======================

router.get('/', async (req, res) => {
  const user = await getUserFromCookie(req);
  const products = await Product.find().lean();
  const welcomeMessage = req.query.welcome && user ? `👋 ¡Bienvenida, ${user.first_name}!` : null;

  res.render('home', { title: 'Inicio', user, products, welcomeMessage });
});

router.get('/dashboard', async (req, res) => {
  const user = await getUserFromCookie(req);
  const products = await Product.find().lean();
  res.render('dashboard', { title: 'Dashboard', user, products });
});

// ====================== CARRITOS ======================

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

// ====================== AGREGAR PRODUCTOS AL CARRITO ======================

router.post('/api/carts/:cid/product/:pid', async (req, res) => {
  try {
    const user = await getUserFromCookie(req);
    if (!user) return res.status(401).json({ message: 'Usuario no autenticado' });

    const { cid, pid } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findById(cid);
    if (!cart) {
      cart = await Cart.create({ _id: cid, products: [] });
    }

    const existingProduct = cart.products.find(p => p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.quantity += quantity || 1;
    } else {
      cart.products.push({ product: pid, quantity: quantity || 1 });
    }

    await cart.save();
    res.json({ message: 'Producto agregado al carrito con éxito', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al agregar producto al carrito', error: err.message });
  }
});

// ====================== PRODUCTOS ======================

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

// ====================== CRUD PRODUCTOS (ADMIN) ======================

router.post('/products', authorize(['admin']), async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

router.put('/products/:pid', authorize(['admin']), async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
  res.json(updatedProduct);
});

router.delete('/products/:pid', authorize(['admin']), async (req, res) => {
  await Product.findByIdAndDelete(req.params.pid);
  res.status(204).send();
});

// ====================== COMPRA / TICKET ======================

router.post('/carts/:cid/purchase', authorize(['user']), async (req, res) => {
  const user = await getUserFromCookie(req);
  if (!user) return res.status(401).json({ message: 'Usuario no autenticado' });

  try {
    const ticket = await ticketService.checkoutCart(req.params.cid, user.email);
    res.json({ message: 'Compra realizada con éxito', ticket });
  } catch (err) {
    console.error('💥 Error al realizar la compra:', err);
    res.status(400).json({ message: 'Hubo un problema al realizar la compra.', error: err.message });
  }
});

// ====================== RESET PASSWORD ======================

router.post('/auth/forgot-password', async (req, res) => {
  try {
    await AuthService.sendResetPasswordEmail(req.body.email);
    res.json({ message: 'Email enviado, revisá tu bandeja' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    await AuthService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
