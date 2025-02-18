const express = require('express');
const mongoose = require('mongoose');
//permet de sécuriser les mdp
require('dotenv').config()
const app = express();
const path = require('path');

// Import des routes pour les livres et les utilisateurs
const bookRoutes = require('./routes/bookRouters'); // Remplace `stuffRoutes` par `bookRoutes`
const userRoutes = require('./routes/userRouters');

mongoose.connect(process.env.BDD, 
  { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use('/api/books', bookRoutes); 
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
