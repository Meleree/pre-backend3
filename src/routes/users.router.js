import express from "express";
import UserDTO from "../dtos/user.dto.js"; 
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/current", authMiddleware, (req, res) => {
  const userDTO = new UserDTO(req.user);
  res.json(userDTO);
});

export default router;
