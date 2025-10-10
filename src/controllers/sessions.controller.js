import AuthService from "../services/auth.service.js";

class SessionsController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res) => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json({ success: true, user });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  login = async (req, res) => {
    try {
      const { user, token } = await this.authService.login(req.body);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000,
      });
      res.status(200).json({ success: true, user, token });
    } catch (err) {
      res.status(401).json({ success: false, message: err.message });
    }
  };

  logout = async (req, res) => {
    try {
      res.clearCookie("token");
      await this.authService.logout(req.user);
      res.json({ success: true, message: "Sesión cerrada correctamente" });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}

export default new SessionsController();
