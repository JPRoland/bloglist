const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

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

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(initialBlogs.length)
})

test('blogs have id property', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'New Author',
      url: 'https://new.test',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    expect(blogsAtEnd.length).toBe(initialBlogs.length + 1)

    const title = blogsAtEnd.map((b) => b.title)
    expect(title).toContain('New Blog')
  })

  test('likes defaults to 0 if missing from request', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'New Author',
      url: 'https://new.test',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blog = await Blog.findOne({ title: 'New Blog' })
    expect(blog.likes).toBe(0)
  })

  test('responds with 400 status if title or author is missing', async () => {
    const newBlog = {
      author: 'New Author',
      url: 'https://new.test',
    }

    await api.post('/api/blogs').send(newBlog).expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
