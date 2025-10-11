export const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    try {
      const user = req.user; 
      if (!user) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
