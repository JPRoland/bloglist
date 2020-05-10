const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  })

  response.json(blogs.map((blog) => blog.toJSON()))
})

blogsRouter.post('/', async (req, res) => {
  const token = req.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()

  user.blogs.concat(savedBlog._id)
  await user.save()

  res.status(201).json(savedBlog.toJSON())
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1,
  })

  if (!blog) {
    return response.status(404).end()
  }

  response.json(blog.toJSON())
})

blogsRouter.delete('/:id', async (req, res) => {
  const token = req.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(req.params.id)

  if (blog.user.toString() !== decodedToken.id) {
    return res.status(401).json({ error: 'You must be logged in to do that' })
  }

  await blog.remove()

  res.status(204).end()
})

blogsRouter.put('/:id', async (req, res) => {
  const token = req.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(req.params.id)

  if (blog.user.toString() !== decodedToken.id) {
    return res.status(401).json({ error: 'You must be logged in to do that' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  )

  res.json(updatedBlog.toJSON())
})

module.exports = blogsRouter
