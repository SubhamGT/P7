const express = require('express');
const router = express.Router();
const fs = require('fs');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');  

router.get('/bestrating', bookCtrl.getTopBooks);
router.get('/:id', bookCtrl.getOneBook);
router.get('/',  bookCtrl.getAllBooks);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.post('/', auth, multer, bookCtrl.createBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;
