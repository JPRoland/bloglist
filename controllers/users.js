const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async (req, res) => {
  if (req.body.password.length < 3) {
    return res
      .status(400)
      .json({ error: 'password must be at least 3 characters' })
  }
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

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  })

  res.json(users.map((user) => user.toJSON()))
})

module.exports = usersRouter
