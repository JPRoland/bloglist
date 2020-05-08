const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const {
  initialBlogs,
  blogsInDB,
  usersInDB,
  validNonExistingId,
} = require('./test_helper')

const api = supertest(app)

describe('With initial blogs saved', () => {
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

  describe('viewing a specific blog', async () => {
    test('succeeds with valid id', async () => {
      const blogsAtStart = await blogsInDB()
      const blogToFind = blogsAtStart[0]

      const response = await api
        .get(`/api/blogs/${blogToFind.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toEqual(blogToFind)
    })

    test('responds with 404 if blog does not exist', async () => {
      const validId = await validNonExistingId()

      await api.get(`/api/blogs/${validId}`).expect(404)
    })

    test('responds with 400 when provided an invalid id', async () => {
      await api.get('/api/blogs/12345').expect(400)
    })
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

      const blogsAtEnd = await blogsInDB()
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
      const blogsBefore = await blogsInDB()
      const blogToDelete = blogsBefore[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

      const blogsAfter = await blogsInDB()
      expect(blogsAfter.length).toBe(initialBlogs.length - 1)

      const titles = blogsAfter.map((blog) => blog.title)
      expect(titles).not.toContain(blogToDelete.title)
    })
  })

  describe('updating a blog', () => {
    test('updates the correct blog', async () => {
      const blogsBefore = await blogsInDB()
      const blogToUpdate = blogsBefore[0]

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ likes: 42 })
        .expect(200)

      const updatedBlog = await Blog.findById(blogToUpdate.id)
      expect(updatedBlog.likes).toBe(42)
    })
  })

  describe('when there is initailly one user in the DB', () => {
    beforeEach(async () => {
      await User.deleteMany({})
      const user = new User({
        username: 'root',
        name: 'Admin',
        passwordHash: 'password',
      })
      await user.save()
    })

    test('creation succeds with fresh username', async () => {
      const usersAtStart = await usersInDB()

      const newUser = {
        username: 'NewTestUser',
        name: 'New Test User',
        password: 'secretpass',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await usersInDB()
      expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

      const usernames = usersAtEnd.map((user) => user.username)
      expect(usernames).toContain(newUser.username)
    })

    test('creation fails with existing username', async () => {
      const usersAtStart = await usersInDB()

      const newUser = {
        username: 'root',
        name: 'New Test User',
        password: 'secretpass',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('`username` to be unique')

      const usersAtEnd = await usersInDB()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
