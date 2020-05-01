const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((favs, blog) => {
    if (!favs.length || blog.likes === favs[0].likes) {
      return favs.concat(blog)
    }
    if (blog.likes > favs[0].likes) {
      return [blog]
    }
    return favs
  }, [])
}

module.exports = {
  dummy,
  favoriteBlog,
  totalLikes,
}
