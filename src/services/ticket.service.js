import Cart from "../dao/models/cart.model.js";
import Product from "../dao/models/product.model.js";
import User from "../dao/models/user.model.js";
import Ticket from "../dao/models/ticket.model.js";
import { sendPurchaseEmail } from "./email.service.js"; // ya existía
import crypto from "crypto";

class TicketService {
  /**
   * Crea un ticket persistente en BD usando Ticket model
   * ticketData: { products: [...], amount: Number, purchaser: emailString }
   */
  async createTicket(ticketData, purchaserName) {
    if (!ticketData.products || ticketData.products.length === 0) {
      throw new Error("No hay productos en el ticket");
    }

    // code único
    const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const ticketDoc = new Ticket({
      code,
      purchase_datetime: new Date(),
      amount: ticketData.amount || 0,
      purchaser: ticketData.purchaser
    });

    await ticketDoc.save();

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
   * - verifica stock
   * - descuenta stock para los productos con suficiente cantidad
   * - arma purchasedProducts y remainingProducts
   * - actualiza carrito (quedarán solo los remaining)
   * - crea Ticket persistente si hay productos comprados
   *
   * Retorna: { ticket: TicketDocument|null, notProcessed: [productIds] }
   */
  async checkoutCart(cartId, userEmail) {
    const cart = await Cart.findById(cartId).populate("products.product");
    if (!cart) throw new Error("Carrito no encontrado");

    const user = await User.findOne({ email: userEmail });
    if (!user) throw new Error("Usuario no encontrado");

    if (!cart.products || cart.products.length === 0) {
      throw new Error("El carrito está vacío");
    }

    const purchasedProducts = [];
    const remainingProducts = [];
    let totalAmount = 0;

    // Iterar items del carrito
    for (const item of cart.products) {
      const product = item.product;
      const qty = item.quantity;

      // A veces product puede venir poblado, a veces no: aseguramos lectura desde modelo
      const dbProduct = await Product.findById(product._id || product);
      if (!dbProduct) {
        // si producto ya no existe, lo consideramos no procesado
        remainingProducts.push(item);
        continue;
      }

      if (dbProduct.stock >= qty) {
        // suficiente stock: descontar y sumar al ticket
        dbProduct.stock -= qty;
        await dbProduct.save();

        purchasedProducts.push({
          productId: dbProduct._id.toString(),
          title: dbProduct.title,
          quantity: qty,
          price: dbProduct.price
        });

        totalAmount += dbProduct.price * qty;
      } else {
        // no hay stock suficiente -> queda en remaining
        remainingProducts.push(item);
      }
    }

    // Actualizar carrito: dejar sólo los productos que no pudieron procesarse
    cart.products = remainingProducts.map(r => ({
      product: r.product._id ? r.product._id : r.product,
      quantity: r.quantity
    }));
    await cart.save();

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
