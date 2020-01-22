const express = require("express");
const router = express.Router();

const User = require("../models/User");

// Importation des packages permettant l'encryption du mot de passe
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Inscription 'Sign Up' : CREATE
router.post("/user/signup", async (req, res) => {
  // Le salt va être ajouté au password pour être hashé
  const salt = uid2(64);
  // Le hash est le résultat de l'encryption du (mot de passe + le salt)
  const hash = SHA256(req.fields.password + salt).toString(encBase64);
  // Le token servira plus tard pour tracer l'utilisateur
  const token = uid2(64);

  try {
    // On recherche dans la base de donées si l'email a déjà été utilisée pour s'inscrire
    const previousUser = await User.findOne({ email: req.fields.email });

    // Si l'email existe déjà dans la base de données : ERREUR et pas d'inscription
    if (!previousUser) {
      // Si le username est manquant : ERREUR et pas d'inscription
      if (req.fields.username) {
        const newUser = new User({
          email: req.fields.email,
          token: token,
          salt: salt,
          hash: hash,
          account: {
            username: req.fields.username,
            phone: req.fields.phone
          }
        });
        await newUser.save();

        // Réponse envoyée au client ne contenant pas de données sensibles
        return res.json({
          _id: newUser._id,
          token: newUser.token,
          email: newUser.email,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone
          }
        });
      } else {
        return res.json({ error: "Enter your username, please" });
      }
    } else {
      return res.json({ error: "This email already exists" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Connection 'Log In' : READ
router.post("/user/login", async (req, res) => {
  try {
    // On cherche dans la base de données le user qui veut se connecter
    const user = await User.findOne({ email: req.fields.email });

    // Si le user existe
    if (user) {
      // Si le hash du mot de passe qu'il vient de saisir est le même que le le hash enregistré dans la base de données lors de l'inscription
      if (
        SHA256(req.fields.password + user.salt).toString(encBase64) ===
        user.hash
      ) {
        return res.json({
          _id: user._id,
          token: user.token,
          email: user.email,
          account: {
            username: user.account.username,
            phone: user.account.phone
          }
        });
      } else {
        // Si le hash est incorrect, il n'est pas autorisé à se connecter
        return res.json({ error: "Unauthorized" });
      }
    } else {
      // Si introuvable dans la base de données
      return res.json({ error: "User not found" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Export des routes
module.exports = router;
