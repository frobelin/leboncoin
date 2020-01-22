const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  // Vérifie si le user est bien authentifié par son token
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", "")
    });
    if (!user) {
      return res.json({ error: "Unauthorized" });
    } else {
      req.user = user;
      next();
    }
  } else {
    return res.json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
