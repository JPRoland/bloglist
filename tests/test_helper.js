const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Test 1',
    author: 'T. Author',
    url: 'http://test1.test',
    likes: 23,
  },
  {
    title: 'Test 2',
    author: 'T. Author',
    url: 'http://test2.test',
    likes: 4,
  },
  {
    title: 'Test 3',
    author: 'A. Tester',
    url: 'http://test3.test',
    likes: 0,
  },
]

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

const validNonExistingId = async () => {
  const blog = new Blog({ title: 'blog', author: 'author', url: 'link' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

module.exports = {
  initialBlogs,
  blogsInDB,
  usersInDB,
  validNonExistingId,
}
