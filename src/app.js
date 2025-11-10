import express from 'express';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import cors from "cors";
import './config/passport.js';
import passwordRouter from './routes/password.router.js';

import sessionsRouter from './routes/sessions.router.js';
import usersViewsRouter from './routes/views.router.js'; 
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import connectDB from './config/db.js';
// IMPORTA EL NUEVO ROUTER DE MOCKS
import mocksRouter from './routes/mocks.router.js';
// IMPORTA LOS ROUTERS DE USERS Y PETS
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET; 

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(SESSION_SECRET));
app.use(passport.initialize()); 

const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath)); 
console.log(`✅ Archivos estáticos servidos desde: ${publicPath}`);

app.engine(
  'handlebars',
  handlebars.engine({
    helpers: {
      json: (context) => JSON.stringify(context),
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, 'views'));

// INTEGRA EL NUEVO ROUTER DE MOCKS, USERS Y PETS
app.use('/api/mocks', mocksRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);

app.use('/api/auth', sessionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.use('/password', passwordRouter);
app.use('/', usersViewsRouter);

const server = http.createServer(app);
const io = new SocketServer(server);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('productAdded', (product) => io.emit('productAdded', product));
  socket.on('deleteProduct', (productId) => io.emit('productDeleted', productId));
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

const PORT = process.env.PORT || 8080;
connectDB().then(() => {
  server.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
  );
});