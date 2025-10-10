// src/services/ticket.service.js (COMPLETO Y REFACTORIZADO)
import { sendPurchaseEmail } from "./email.service.js"; // Se asume que existe
import TicketRepository from '../repositories/ticket.repository.js';
import CartsRepository from '../repositories/carts.repository.js';
import UserRepository from '../repositories/users.repository.js';
import ProductRepository from '../repositories/products.repository.js';

class TicketService {
    constructor() {
        // 🚨 Instanciación de todos los repositorios requeridos
        this.ticketRepository = new TicketRepository();
        this.cartRepository = new CartsRepository();
        this.userRepository = new UserRepository();
        this.productRepository = new ProductRepository();
    }
    
    /**
     * Crea un ticket persistente en BD usando Ticket model
     */
    async createTicket(ticketData, purchaserName) {
        if (!ticketData.products || ticketData.products.length === 0) {
            throw new Error("No hay productos para crear el ticket");
        }

        // El code único debe ser generado en el DAO o aquí si no usas pre-save hook en el Modelo
        const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // 🚨 Llama al Repositorio para la persistencia
        const ticketDoc = await this.ticketRepository.create({
            code,
            purchase_datetime: new Date(),
            amount: ticketData.amount || 0,
            purchaser: ticketData.purchaser
        });

        // Enviar email de compra (intento, no bloqueante)
        try {
            await sendPurchaseEmail(
                ticketData.purchaser,
                ticketData.products,
                ticketData.amount,
                purchaserName,
                code
            );
            console.log(`✅ Email de compra enviado a: ${ticketData.purchaser}`);
        } catch (err) {
            console.error("Error enviando email de ticket:", err);
        }

        return ticketDoc;
    }

    /**
     * checkoutCart: procesa la compra del carrito
     */
    async checkoutCart(cartId, userEmail) {
        // 🚨 USANDO REPOSITORIOS
        const cart = await this.cartRepository.getCartById(cartId);
        if (!cart) throw new Error("Carrito no encontrado");

        const user = await this.userRepository.getUserByEmail(userEmail);
        if (!user) throw new Error("Usuario no encontrado");

        if (!cart.products || cart.products.length === 0) {
            throw new Error("El carrito está vacío");
        }

        const purchasedProducts = [];
        const remainingProducts = [];
        let totalAmount = 0;

        // Iterar items del carrito
        for (const item of cart.products) {
            const product = item.product; // Debe venir populado desde CartDAO
            const qty = item.quantity;
            
            // 🚨 USANDO REPOSITORIOS: Obtener la versión más reciente del producto
            const dbProduct = await this.productRepository.getById(product._id || product); 
            
            if (!dbProduct) {
                // Producto no encontrado, queda sin procesar
                remainingProducts.push(item);
                continue;
            }

            if (dbProduct.stock >= qty) {
                // Suficiente stock: descontar y sumar al ticket
                
                // 🚨 USANDO REPOSITORIOS: Actualizar stock en la DB
                await this.productRepository.update(dbProduct._id, { stock: dbProduct.stock - qty });

                purchasedProducts.push({
                    productId: dbProduct._id.toString(),
                    title: dbProduct.title,
                    quantity: qty,
                    price: dbProduct.price
                });

                totalAmount += dbProduct.price * qty;
            } else {
                // No hay stock suficiente -> queda en remaining
                remainingProducts.push(item);
            }
        }

        // 🚨 USANDO REPOSITORIOS: Actualizar carrito: dejar sólo los productos que no pudieron procesarse
        const productsToSaveInCart = remainingProducts.map(r => ({
            product: r.product._id ? r.product._id : r.product, // Asegura que se guarda la referencia ID
            quantity: r.quantity
        }));
        
        // 🚨 LLama al CartsRepository.update que modificamos
        await this.cartRepository.update(cartId, { products: productsToSaveInCart });


        // Si no se compró nada, devolvemos arreglo con ids no procesados y ticket null
        if (purchasedProducts.length === 0) {
            const notProcessedIds = remainingProducts.map(p => (p.product._id ? p.product._id.toString() : p.product.toString()));
            return { ticket: null, notProcessed: notProcessedIds };
        }

        // Crear ticket persistente
        const ticketDoc = await this.createTicket(
            {
                products: purchasedProducts,
                amount: totalAmount,
                purchaser: user.email
            },
            `${user.first_name || ''} ${user.last_name || ''}`.trim()
        );

        const notProcessedIds = remainingProducts.map(p => (p.product._id ? p.product._id.toString() : p.product.toString()));

        return { ticket: ticketDoc, notProcessed: notProcessedIds };
    }
}

export default TicketService;