const {Book} = require('../models/Book')
const express = require('express')
const { upload } = require('../middlewares/multer')
const jwt = require('jsonwebtoken')

const booksRouter = express.Router()
booksRouter.get("/", getBooks)
booksRouter.get("/:id", getBookById)
booksRouter.post("/", checkToken, upload.single("image"),postBook)

function checkToken (req, res, next) {
    const headers = req.headers
    const authorization = headers.authorization
    if(authorization == null) {
        res.status(401).send("Unauthorized")
        return
    }
    const token = authorization.split(" ")[1]
    console.log("token", token)
    try {const tokenPayload =jwt.verify(token, process.env.JWT_SECRET)
        console.log("tokenPayload", tokenPayload)
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
    const books = await Book.find()
    books.forEach(book => {
        book.imageUrl = getAbsoluteImagePath(book.imageUrl)
    })
    res.send(books)
}

function getAbsoluteImagePath(fileName) {
    return process.env.PUBLIC_URL + "/" + process.env.IMAGES_FOLDER_PATH + "/" + fileName
}






module.exports = { booksRouter }