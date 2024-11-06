const Book = require('../models/Book'); 
const fs = require('fs');

// Création d'un nouveau livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete  bookObject._id;
  delete  bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};



// Récupération d'un seul livre
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du livre' });
  }
};




// Récupération de tous les livres
exports.getAllBooks = async (req, res) => {
Book.find()
.then((books)=> res.status(200).json(books))
.catch((error) => res.status(404).json({error}))
};

// Ajout d'une note à un livre
exports.rateBook = async (req, res) => {
  const { userId, rating } = req.body;
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être entre 0 et 5' });
  }

  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

    const existingRating = book.ratings.find(r => r.userId === userId);
    if (existingRating) return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });

    book.ratings.push({ userId, grade: rating });
    book.averageRating = book.ratings.reduce((sum, r) => sum + r.grade, 0) / book.ratings.length;

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(505).json({ error: 'Erreur lors de l\'ajout de la note' });
  }
};

// Récupération des livres les mieux notés
exports.getTopBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1 }) // Trie par note moyenne décroissante
      .limit(5); // Limite à 5 résultats
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la récupération des livres' });
  }
}; 



// Récupération d'un seul livre
exports.getOneBook = async (req, res) => {
  Book.findOne({ _id: req.params.id })
  .then((book) => res.status(200).json(book))
  .catch((error) => res.status(404).json({ error }));
};

// Modification d'un livre
exports.modifyBook = async (req, res) => {
  try {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    if (book.userId != req.auth.userId) return res.status(403).json({ message: 'Requête non autorisée' });
    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async (err) => {
      if (err) return res.status(501).json({ error: 'Erreur lors de la suppression de l\'image' });
    })
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la modification du livre' });
  }
};

// Suppression d'un livre
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    if (book.userId != req.auth.userId) return res.status(403).json({ message: 'Requête non autorisée' });

    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async (err) => {
      if (err) return res.status(501).json({ error: 'Erreur lors de la suppression de l\'image' });
      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'Livre supprimé !' });
    });
  } catch (error) {
    res.status(501).json({ error: 'Erreur lors de la suppression du livre' });
  }
};

// Récupération de tous les livres
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la récupération des livres' });
  }
};

// Ajout d'une note à un livre
exports.createBook = async (req, res) => {
  try {
    if (!req.file || !req.body.book) {
      return res.status(400).json({ error: "Image et données du livre sont requises." });
    }

    let bookObject;
    try {
      bookObject = JSON.parse(req.body.book);
    } catch (error) {
      return res.status(400).json({ error: "Format des données du livre invalide." });
    }

    if (!bookObject.title || !bookObject.author || !bookObject.genre || !bookObject.year) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis." });
    }

    bookObject.year = Number(bookObject.year);
    if (isNaN(bookObject.year)) {
      return res.status(400).json({ error: "L'année doit être un nombre valide." });
    }

    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    console.error("Erreur lors de la création du livre :", error);
    res.status(500).json({ error: error.message });
  }
};


// Récupération des livres les mieux notés
exports.getTopBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1 }) // Trie par note moyenne décroissante
      .limit(3); // Limite à 5 résultats
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la récupération des livres' });
  }
};
