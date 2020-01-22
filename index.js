// Importation du package pour créer un serveur
const express = require("express");
// Importation du package pour récupérer les paramètres transmis lors des requêtes HTTP de type POST
// Permet d'utiliser les req.fields
const formidableMiddleware = require("express-formidable");
// Importation du package pour manipuler des bases de données MongoDB
const mongoose = require("mongoose");

// Initialisation du Serveur appelé 'app'
const app = express();
// Active la possibilité de récupérer les paramètres tramsmis lors des requêtes HTTP de type POST
app.use(formidableMiddleware());

// Initialisation d'une base de données
mongoose.connect("mongodb://localhost/leboncoin-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

// Importation des routes se trouvant dans le fichier user.js se trouvant lui-même dans le dossier 'routes'
const userRoutes = require("./routes/user");
// Activation de l'utilisation des routes
app.use(userRoutes);

// Pour gérer les pages introuvables
app.all("*", (req, res) => {
  res.json({ message: "Page not found" });
});

// Pour démarrer le serveur : écoute du port 3000
app.listen(3000, () => {
  console.log("Server started");
});
