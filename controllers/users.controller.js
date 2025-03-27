const { User } = require('../models/User')
const bcrypt = require('bcrypt')
const e = require('express')
const express = require('express')
const jwt = require('jsonwebtoken')

const usersRouter = express.Router()
usersRouter.post("/signup", signUp)
usersRouter.post("/login", logIn)

async function signUp(req, res) {
    const email = req.body.email
    const password = req.body.password
    if (email == null || password == null) {
      res.status(400).send("Email and password are require")
      return
    }
    try {
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
      } catch {
        console.error(e)
        res.status(500).send("Something went wrong")
      }
}



async function logIn(req, res) {
    const body = req.body;
    if (email == null || body.password == null) {
      res.status(400).send("Email and password are require")
      return
    }
    try {
      const userInDb = await User.findOne({
          email: body.email
      })
      if (userInDb == null) {
          res.status(401).send("wrong credentials")
          return
      }

      const passwordInDb = userInDb.password
      if (!isPasswordCorrect (req.body.password, passwordInDb)) {
          res.status(401).send("wrong credentials")
          return
      }


      res.send({
        userId: userInDb._id,
        token: generateToken(userInDb._id)
      });
    } catch {
      console.error(e)
      res.status(500).send("Something went wrong")
    }
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




module.exports = { usersRouter }
