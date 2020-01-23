const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");

// Route pour les tests !... et lire le req.user !
router.post("/offer/test", isAuthenticated, async (req, res) => {
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

// Création d'une fonction pour créer l'objet filtre du find
const createFilters = req => {
  const filters = {};

  // Gestion du prix minimum
  if (req.query.priceMin) {
    filters.price = {};
    filters.price.$gte = req.query.priceMin;
  }

  // Gestion du prix maximum
  if (req.query.priceMax) {
    if (filters.price === undefined) {
      filters.price = {};
    }
    filters.price.$lte = req.query.priceMax;
  }

  // Gestion de l'objet de la demande
  if (req.query.title) {
    filters.title = new RegExp(req.query.title, "i");
  }

  // Envoi de l'objet final avec les filtres
  return filters;
};

// Route pour faire la recherche d'annonces spécifiques
router.get("/offer/with-count", async (req, res) => {
  try {
    const filters = createFilters(req);

    // Construction de la recherche
    const search = Offer.find(filters).populate({
      path: "creator",
      select: "account"
    });

    // Gestion de l'ordre d'affichage des prix des annonces
    if (req.query.sort === "price-asc") {
      search.sort({ price: 1 });
    } else if (req.query.sort === "price-desc") {
      search.sort({ price: -1 });
    }

    // Gestion de l'affichage des résultats par page
    if (req.query.page) {
      const page = req.query.page;
      const limit = 4;

      search.limit(limit).skip(limit * (page - 1));
    }

    // Déclenchement de la recherche grace au await
    const offers = await search;
    res.json({
      count: offers.length,
      offers: offers
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Service web pour récupérer les détails d'une annonce en fonction de son id
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "creator",
      select: "account"
    });
    res.json(offer);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Export des routes
module.exports = router;
