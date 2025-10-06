import { Router } from "express";
import cartService from "../services/cart.service.js";
import TicketService from "../services/ticket.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();
const ticketService = new TicketService();

// ====================== CREAR CARRITO ======================
router.post("/", async (req, res) => {
  try {
    const cart = await cartService.createCart();
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    console.error("❌ Error al crear carrito:", err);
    res.status(500).json({ status: "error", message: "Error al crear el carrito" });
  }
});

// ====================== OBTENER CARRITO POR ID ======================
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.cid);
    res.json(cart);
  } catch (err) {
    console.error("❌ Error al obtener carrito:", err);
    res.status(404).json({ message: err.message });
  }
});

// ====================== AGREGAR PRODUCTO AL CARRITO ======================
// Solo usuarios autenticados con rol 'user' pueden agregar productos
router.post("/:cid/product/:pid", authMiddleware, authorize("user"), async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity) || 1;
    const cart = await cartService.addProduct(req.params.cid, req.params.pid, quantity);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    console.error("❌ Error al agregar producto al carrito:", err);
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ====================== ACTUALIZAR CANTIDAD DE PRODUCTO ======================
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const quantityChange = parseInt(req.body.quantity);
    if (isNaN(quantityChange)) throw new Error("Cantidad inválida");

    const cart = await cartService.updateProductQuantity(req.params.cid, req.params.pid, quantityChange);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    console.error("❌ Error al actualizar cantidad:", err);
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ====================== ELIMINAR PRODUCTO DEL CARRITO ======================
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await cartService.removeProduct(req.params.cid, req.params.pid);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ====================== VACIAR CARRITO ======================
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    console.error("❌ Error al vaciar carrito:", err);
    res.status(400).json({ status: "error", message: err.message });
  }
});

// ====================== REALIZAR COMPRA ======================
// Requiere autenticación y rol 'user'
router.post("/:cid/purchase", authMiddleware, authorize("user"), async (req, res) => {
  try {
    const { cid } = req.params;
    const user = req.user; // viene desde authMiddleware
    if (!user || !user.email) {
      return res.status(401).json({ message: "Usuario no autenticado o token inválido." });
    }

    const result = await ticketService.checkoutCart(cid, user.email);

    if (!result.ticket) {
      return res.status(400).json({
        status: "error",
        message: "No se pudo procesar la compra: no hay productos disponibles.",
        notProcessed: result.notProcessed
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Compra realizada con éxito",
      ticket: result.ticket,
      notProcessed: result.notProcessed
    });
  } catch (err) {
    console.error("💥 Error al realizar el purchase:", err);
    res.status(500).json({ message: err.message || "Hubo un problema al realizar la compra" });
  }
});

// ====================== COMPATIBILIDAD /checkout ======================
router.post("/:cid/checkout", authMiddleware, authorize("user"), async (req, res) => {
  try {
    const { cid } = req.params;
    const user = req.user;
    const result = await ticketService.checkoutCart(cid, user.email);

    if (!result.ticket) {
      return res.status(400).json({
        status: "error",
        message: "No se pudo procesar la compra: no hay productos disponibles.",
        notProcessed: result.notProcessed
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Checkout realizado con éxito",
      ticket: result.ticket,
      notProcessed: result.notProcessed
    });
  } catch (err) {
    console.error("💥 Error en /checkout:", err);
    res.status(500).json({ message: err.message || "Hubo un problema al realizar el checkout" });
  }
});

export default router;
