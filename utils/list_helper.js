const dummy = (blogs) => {
  return 1
}

const groupBy = (data, key) => {
  return data.reduce((rv, item) => {
    rv[item[key]] = rv[item[key]] || []
    rv[item[key]].push(item)
    return rv
  }, {})
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

const mostBlogs = (blogs) => {
  const groupedByAuthor = groupBy(blogs, 'author')

  return Object.keys(groupedByAuthor).reduce(
    (rv, author) => {
      if (groupedByAuthor[author].length > rv.blogs) {
        rv.author = author
        rv.blogs = groupedByAuthor[author].length
      }

      return rv
    },
    { author: '', blogs: 0 }
  )
}

const mostLikes = (blogs) => {
  const groupedByAuthor = groupBy(blogs, 'author')
  const summedLikes = Object.keys(groupedByAuthor).map((author) => {
    return {
      author,
      likes: totalLikes(groupedByAuthor[author]),
    }
  })

  return summedLikes.reduce((prev, curr) => {
    return curr.likes > prev.likes ? curr : prev
  })
}

module.exports = {
  dummy,
  favoriteBlog,
  totalLikes,
  mostBlogs,
  mostLikes,
}
