const mongoose = require('mongoose')


const books = [
    
]

module.exports = {books}

const BookSchema = new mongoose.Schema({
    userId: String,
    title: String,
    author: String,
    year: Number,
    genre: String,
    imageUrl: String,
    ratings: [
        {
            userId: String,
            grade: Number
        }
    ],
    averageRating: Number,
})

const Book = mongoose.model("book", BookSchema)

module.exports = {Book}