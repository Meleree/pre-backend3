import ProductsDAO from './managers/products.dao.js';
import CartsDAO from './managers/carts.dao.js';
import UsersDAO from './managers/users.dao.js';
import TicketsDAO from './managers/tickets.dao.js'; // <--- Agregado

export const productsDAO = new ProductsDAO();
export const cartsDAO = new CartsDAO();
export const usersDAO = new UsersDAO();
export const ticketsDAO = new TicketsDAO(); // <--- Agregado