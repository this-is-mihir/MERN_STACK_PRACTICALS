const express = require('express')

const app = express()

const PORT = 4000


app.use(express.json())


const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
  next()
}

app.use(requestLogger)


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Book Library API'
  })
})


app.get('/api/books', (req, res) => {
  const books = [
    {
      id: 1,
      title: 'Wings of Fire',
      author: 'A.P.J. Abdul Kalam',
      genre: 'Autobiography'
    },
    {
      id: 2,
      title: '2 States',
      author: 'Chetan Bhagat',
      genre: 'Fiction'
    },
    {
      id: 3,
      title: 'The Guide',
      author: 'R.K. Narayan',
      genre: 'Novel'
    }
  ]

  res.json(books)
})


app.get('/api/books/:id', (req, res) => {
  const bookId = req.params.id

  res.json({
    message: 'Book fetched successfully',
    bookId: bookId
  })
})


app.post('/api/books', (req, res) => {
  const book = req.body

  res.status(201).json({
    message: 'Book added successfully',
    book: book
  })
})


app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  })
})


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})