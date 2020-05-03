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

describe('deleting a blog', () => {
  test('provided an id, responds with 204 and deletes the blog', async () => {
    const blogsBefore = await Blog.find({})
    const blogToDelete = blogsBefore[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAfter = await Blog.find({})
    expect(blogsAfter.length).toBe(initialBlogs.length - 1)

    const titles = blogsAfter.map((blog) => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('updates the correct blog', async () => {
    const blogsBefore = await Blog.find({})
    const blogToUpdate = blogsBefore[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 42 })
      .expect(200)

    const updatedBlog = await Blog.findById(blogToUpdate.id)
    expect(updatedBlog.likes).toBe(42)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
