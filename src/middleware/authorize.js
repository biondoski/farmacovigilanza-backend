exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accesso negato. L'utente con ruolo '${req.user ? req.user.role : 'sconosciuto'}' non è autorizzato.` 
      });
    }
    next();
  };
};
