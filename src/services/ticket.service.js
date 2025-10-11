import { sendPurchaseEmail } from "./email.service.js";
import TicketRepository from '../repositories/ticket.repository.js';
import CartsRepository from '../repositories/carts.repository.js';
import UserRepository from '../repositories/users.repository.js';
import ProductRepository from '../repositories/products.repository.js';

class TicketService {
    constructor() {
        this.ticketRepository = new TicketRepository();
        this.cartRepository = new CartsRepository();
        this.userRepository = new UserRepository();
        this.productRepository = new ProductRepository();
    }

    async createTicket(ticketData, purchaserName) {
        if (!ticketData.products || ticketData.products.length === 0) {
            throw new Error("No hay productos para crear el ticket");
        }

        const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const ticketDoc = await this.ticketRepository.create({
            code,
            purchase_datetime: new Date(),
            amount: ticketData.amount || 0,
            purchaser: ticketData.purchaser
        });

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

    async checkoutCart(cartId, userEmail) {
        const cart = await this.cartRepository.getCartById(cartId);
        if (!cart) return {
            status: "empty",
            ticket: null,
            notProcessed: [],
            notProcessedNames: [],
            message: "El carrito no existe o fue eliminado."
        };

        const user = await this.userRepository.getUserByEmail(userEmail);
        if (!user) return {
            status: "empty",
            ticket: null,
            notProcessed: [],
            notProcessedNames: [],
            message: "El usuario no existe."
        };

        if (!cart.products || cart.products.length === 0) {
            return {
                status: "empty",
                ticket: null,
                notProcessed: [],
                notProcessedNames: [],
                message: "No hay productos en tu carrito para comprar."
            };
        }

        const purchasedProducts = [];
        const remainingProducts = [];
        let totalAmount = 0;
        const notProcessedNames = [];

        for (const item of cart.products) {
            const product = item.product;
            const qty = item.quantity;

            const dbProduct = await this.productRepository.getById(product._id || product);

            if (!dbProduct) {
                remainingProducts.push(item);
                notProcessedNames.push("Producto desconocido");
                continue;
            }

            if (dbProduct.stock >= qty) {
                await this.productRepository.update(dbProduct._id, { stock: dbProduct.stock - qty });

                purchasedProducts.push({
                    productId: dbProduct._id.toString(),
                    title: dbProduct.title,
                    quantity: qty,
                    price: dbProduct.price
                });

                totalAmount += dbProduct.price * qty;
            } else {
                remainingProducts.push(item);
                notProcessedNames.push(dbProduct.title);
            }
        }

        const productsToSaveInCart = remainingProducts.map(r => ({
            product: r.product._id ? r.product._id : r.product,
            quantity: r.quantity
        }));
        await this.cartRepository.update(cartId, { products: productsToSaveInCart });

        if (purchasedProducts.length === 0) {
            return {
                status: "empty",
                ticket: null,
                notProcessed: [],
                notProcessedNames,
                message: "Ningún producto de tu carrito tiene stock disponible para comprar."
            };
        }

        const ticketDoc = await this.createTicket(
            {
                products: purchasedProducts,
                amount: totalAmount,
                purchaser: user.email
            },
            `${user.first_name || ''} ${user.last_name || ''}`.trim()
        );

        const notProcessedIds = remainingProducts.map(p => (p.product._id ? p.product._id.toString() : p.product.toString()));

        return {
            status: "success",
            ticket: ticketDoc,
            notProcessed: notProcessedIds,
            notProcessedNames
        };
    }
}

export default TicketService;