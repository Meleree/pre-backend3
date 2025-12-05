import express from "express";
import User from "../dao/models/user.model.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para la gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error en el servidor
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;