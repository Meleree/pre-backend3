import { Router } from 'express';
import passport from 'passport';
import { signToken } from '../utils/jwt.js'; 
import UserDTO from '../dto/user.dto.js';
import AuthService from '../services/auth.service.js';
import TicketService from '../services/ticket.service.js';
import { authorize } from '../middlewares/auth.middleware.js'; 
import CartService from '../services/cart.service.js'; 
import ProductService from '../services/product.service.js'; 

const router = Router();
const ticketService = new TicketService();
const cartService = CartService; 
const productService = ProductService; 

// ====================== LOGIN / REGISTER (Lógica de API/Auth) ======================

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, age } = req.body;
        const newUser = await AuthService.registerUser({ first_name, last_name, email, password, age });
        const token = signToken(newUser); 

        res.cookie('currentUser', token, { 
            signed: true, 
            httpOnly: true, 
            path: '/', 
            sameSite: "lax" 
        });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(201).json({ success: true, user: new UserDTO(newUser), token });
        }

        res.redirect('/?welcome=true');

    } catch (err) {
        console.error('Error en POST /register:', err);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(400).json({ success: false, message: err.message });
        } else {
            res.redirect(`/register?error=${encodeURIComponent(err.message)}`);
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await AuthService.loginUser({ email, password });
        const token = signToken(user);

        res.cookie('currentUser', token, { 
            signed: true, 
            httpOnly: true, 
            path: '/', 
            sameSite: "lax" 
        });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(200).json({ success: true, user: new UserDTO(user), token });
        }

        res.redirect('/?welcome=true');

    } catch (err) {
        console.error('Error en POST /login:', err);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(401).json({ success: false, message: err.message });
        } else {
            res.redirect('/login?error=true');
        }
    }
});

// ====================== API PERFIL / CURRENT ======================

// GET /api/auth/current 
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const userDto = new UserDTO(req.user);
        res.json(userDto);
    }
);

// ====================== API DE CARRITOS / COMPRA ======================

router.post('/carts/:cid/product/:pid', authorize(['user']), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const cart = await cartService.addProduct(cid, pid, quantity);
        res.json({ message: 'Producto agregado al carrito', cart });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/carts/:cid/purchase', authorize(['user']), async (req, res) => {
    if (!req.user || !req.user.email) return res.status(401).json({ message: 'Usuario no autenticado o token inválido' });

    try {
        const result = await ticketService.checkoutCart(req.params.cid, req.user.email);
        res.json({ message: 'Compra procesada con éxito', ...result });
    } catch (err) {
        console.error('💥 Error al realizar la compra:', err);
        res.status(400).json({ message: 'Hubo un problema al realizar la compra.', error: err.message });
    }
});

// ====================== API CRUD PRODUCTOS (ADMIN) ======================

router.post('/products', authorize(['admin']), async (req, res) => {
    try {
        const newProduct = await productService.create(req.body);
        res.status(201).json({ message: 'Producto creado', product: newProduct });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/products/:pid', authorize(['admin']), async (req, res) => {
    try {
        const updatedProduct = await productService.update(req.params.pid, req.body);
        res.json({ message: 'Producto actualizado', product: updatedProduct });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

router.delete('/products/:pid', authorize(['admin']), async (req, res) => {
    try {
        await productService.delete(req.params.pid);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});


// ====================== API RESET PASSWORD ======================

router.post('/forgot-password', async (req, res) => {
    try {
        await AuthService.sendResetPasswordEmail(req.body.email);
        res.json({ message: 'Email enviado, revisá tu bandeja' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        await AuthService.resetPassword(req.body.token, req.body.newPassword);
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;