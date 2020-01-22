const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");

// Importation des packages permettant l'encryption du mot de passe
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Route pour les tests !... et lire le req.user !
router.post("/user/test", isAuthenticated, async (req, res) => {
  console.log(req.user);
  res.json({ message: "Test route" });
});

// On utilise notre middleware isAuthenticated sur la route '/offer/publish'
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const previousOffer = await Offer.findOne({ title: req.fields.title });
    // Si l'offre existe déjà dans la base de données : MESSAGE et pas de publication
    if (previousOffer) {
      return res.json({ message: "This offer already exists" });
    } else {
      const newOffer = new Offer({
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        creator: req.user._id
      });
      await newOffer.save();

      res.json({
        _id: newOffer._id,
        title: newOffer.title,
        description: newOffer.description,
        price: newOffer.price,
        created: newOffer.created,
        creator: {
          account: {
            username: req.user.account.username,
            phone: req.user.account.phone
          },
          _id: req.user._id
        }
      });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Export des routes
module.exports = router;
