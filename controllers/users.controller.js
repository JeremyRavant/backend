const { User } = require('../models/User')
const bcrypt = require('bcrypt')
const express = require('express')
const jwt = require('jsonwebtoken')

async function signUp(req, res) {
    const email = req.body.email
    const password = req.body.password


    const userInDb = await User.findOne({
        email: email
    })
    if (userInDb != null) {
        res.status(400).send("email already exists")
        return
    }
    const user = {
        email: email,
        password: hashPassword(password)
    }
    User.create(user)
    
    res.send("Sign up")
}



async function logIn(req, res) {
    const body = req.body;
    const userInDb = await User.findOne({
        email: body.email
    })
    if (userInDb == null) {
        res.status(401).send("wrong email")
        return
    }

    const passwordInDb = userInDb.password
    if (!isPasswordCorrect (req.body.password, passwordInDb)) {
        res.status(401).send("wrong password")
        return
    }


    res.send({
      userId: userInDb._id,
      token: generateToken(userInDb._id)
    });
  }


  function generateToken (idInDB) {   
    const payload = {
        userId: idInDB,
      }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d"
    })
    return token
  }

    
  function hashPassword (password){
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)
    return hash
  }

  function isPasswordCorrect (password, hash) {
    return bcrypt.compareSync(password, hash)
  }

  const usersRouter = express.Router()
  usersRouter.post("/signup", signUp)
  usersRouter.post("/login", logIn)

module.exports = { usersRouter }
