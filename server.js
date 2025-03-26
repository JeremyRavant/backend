const {app} = require('./config/app')
const { signUp, logIn} = require ('./controllers/users.controller')
const { booksRouter} = require('./controllers/books.controller')
const { usersRouter} = require('./controllers/users.controller')

app.get('/', (req, res) => res.send("server running!"))

app.use("/api/auth", usersRouter)
app.use("/api/books", booksRouter)
