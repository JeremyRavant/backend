const {app} = require('./config/app')
const { booksRouter} = require('./controllers/books.controller')
const { usersRouter} = require('./controllers/users.controller')

const PORT = process.env.PORT || 4000


app.get('/', (req, res) => res.send("server running!"))

app.use("/api/auth", usersRouter)
app.use("/api/books", booksRouter)


app.listen(PORT, function(){
    console.log(`Server is running on ${PORT}`)
})