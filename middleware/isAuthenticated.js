const User = require("../models/User");

// Les middleware = fonctions utilisées par Express pour ajouter des fonctionnalités sur une route

// Dans ce cas : pour protéger une route, la sécuriser

// express nous passe la requète (req), la réponse (res) et une fonction next qui permet d'indiquer à express que l'on a fini
const isAuthenticated = async (req, res, next) => {
  // Vérifie si le user est bien authentifié par son token
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", "")
    });
    if (!user) {
      return res.json({ error: "Unauthorized" });
    } else {
      // créer une clé "user" dans req. La route pourra avoir accès à req.user
      req.user = user;
      return next();
    }
  } else {
    return res.json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
