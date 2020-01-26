const mongoose = require("mongoose");

// Création du modèle Offer (collection "Offer")
const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  created: {
    type: Date,
    default: Date.now
  },
  // Création d'une référence vers un modèle nommé `User`
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = Offer;
