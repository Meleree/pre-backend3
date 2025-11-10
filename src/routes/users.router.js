import express from "express";
import User from "../dao/models/user.model.js";

const router = express.Router();

// Endpoint para listar todos los usuarios en la base
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;