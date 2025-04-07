const mongoose = require('mongoose');
const {Book} = require('../models/Book')
const express = require('express')
const { upload, optimize } = require('../middlewares/multer');
const jwt = require('jsonwebtoken')

const booksRouter = express.Router()
booksRouter.get("/bestrating", getBestRating)
booksRouter.get("/", getBooks)
booksRouter.get("/:id", getBookById)
booksRouter.post("/", checkToken, upload.single("image"), optimize, postBook)
booksRouter.delete("/:id", checkToken, deleteBook)
booksRouter.put("/:id", checkToken, upload.single("image"), optimize, putBook)
booksRouter.post("/:id/rating", checkToken, postRating)

async function postRating (req,res) {
    const id = req.params.id
    if (id == null || id == "undefined") {
        res.status(400).send("Book id is missing")
        return
    }
    const rating = req.body.rating
    const userId = req.tokenPayload.userId
    try {
        const book = await Book.findById(id)
        if (book == null) {
            res.status(404).send("Book not find")
            return
        }
        const ratingsInDb = book.ratings
        const previousRagtingFromCurrentUser = ratingsInDb.find((rating) => rating.userId == userId)    
        if (previousRagtingFromCurrentUser != null) {
            res.status(400).send("You have already rated tis book")
            return
        }    
        const newRating = { userId: userId, grade: rating}
        ratingsInDb.push(newRating)
        book.averageRating = calculateAverageRating(ratingsInDb)
        await book.save()
        book.imageUrl = getAbsoluteImagePath(book.imageUrl)
        res.json(book)
    }   catch (e) {
        console.error(e)
        res.status(500).send("something went xrong:" + e.message)
    }
}

function calculateAverageRating (ratings) {
    const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0)
    return sumOfAllGrades / ratings.length  
}

async function getBestRating(req, res) {
    try {
        const bookWithBestRating = await Book.find().sort({rating: -1 }).limit(3)
        bookWithBestRating.forEach((book) => {
            book.imageUrl = getAbsoluteImagePath(book.imageUrl)
        })
        res.send(bookWithBestRating)
    } catch(e) {
        console.error(e)
        res.status(500).send("Something went wrong" + e.message)
    }
}


async function putBook (req, res) {
    const id = req.params.id
    const book = JSON.parse(req.body.book)

    const newBook = {}
    if (book.title) newBook.title = book.title;
    if (book.author) newBook.author = book.author;
    if (book.year) newBook.year = book.year;
    if (book.genre) newBook.genre = book.genre;
    if (req.file != null) newBook.imageUrl = req.file.filename;


    await Book.findByIdAndUpdate(id, newBook,)
    res.send("Book updated")
}


async function deleteBook(req, res) {
    const id = req.params.id;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid book ID");
    }
  
    try {
      const bookInDB = await Book.findByIdAndDelete(id);
      if (!bookInDB) {
        return res.status(404).send("Book not found");
      }
      res.send("Book deleted!");
    } catch (e) {
      res.status(500).send("Something went wrong: " + e.message);
    }
  }


function checkToken (req, res, next) {
    const headers = req.headers
    const authorization = headers.authorization
    if(authorization == null) {
        res.status(401).send("Unauthorized")
        return
    }
    const token = authorization.split(" ")[1]
    try {
        const tokenPayload =jwt.verify(token, process.env.JWT_SECRET)
        if (tokenPayload == null) {
            res.status(401).send("Unauthorized")
        }
        req.tokenPayload = tokenPayload;
        next()
    } catch (e) {
        console.error(e)
        res.status(401).send("Unauthorized")
    }
}


async function getBookById(req, res) {
    const id = req.params.id
    try{
    const book = await Book.findById(id)
    if (book == null) {
        res.status(404).send("Book not found")
        return
    }
    book.imageUrl = getAbsoluteImagePath(book.imageUrl)
    res.send(book)
    } catch (e) {
        console.error(e)
        res.status(500).send("something went wrong:" + e.message)
    }
}


async function postBook(req, res) {
    const stringifieldbook = req.body.book
    const book = JSON.parse(stringifieldbook)
    book.userId = req.tokenPayload.userId
    const filename = req.file.filename
    book.imageUrl = filename
        try {
            const result = await Book.create(book)
            res.send({message: "Book posted", book: result})
        } catch (e){
            console.error(e)
            res.status(500).send("something went wrong" + e.message)
        }

}

async function getBooks(req, res) {
    try {
    const books = await Book.find()
    books.forEach(book => {
        book.imageUrl = getAbsoluteImagePath(book.imageUrl)
    })
    res.send(books)
    } catch(e) {
        console.error(e)
        res.status(500).send("Something went wrong" + e.message)
    }
}

function getAbsoluteImagePath(fileName) {
    return process.env.PUBLIC_URL + "/" + process.env.IMAGES_FOLDER_PATH + "/" + fileName
}




module.exports = { booksRouter }