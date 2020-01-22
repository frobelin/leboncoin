const mongoose = require("mongoose");

// Création du modèle User (collection "User")
const User = mongoose.model("User", {
  email: { type: String, unique: true },
  token: String,
  salt: String,
  hash: String,
  account: {
    username: { type: String, required: true },
    phone: { type: String }
  }
});

// Export du modèle
module.exports = User;
