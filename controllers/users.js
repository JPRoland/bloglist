const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async (req, res) => {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(req.body.password, saltRounds)

  const user = new User({
    username: req.body.username,
    name: req.body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  res.json(savedUser.toJSON())
})

module.exports = usersRouter
