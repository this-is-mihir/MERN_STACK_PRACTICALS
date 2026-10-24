const express = require('express')

const app = express()
const PORT = 5000

// In-Memory Data
let users = [
  { id: 1, name: 'Aarav Sharma', role: 'admin' },
  { id: 2, name: 'Diya Patel', role: 'user' },
  { id: 3, name: 'Rohan Verma', role: 'user' }
]

// ==================== 1. MIDDLEWARE ====================

// Built-in Middleware (Parses incoming JSON body)
app.use(express.json())

// Custom Application-level Middleware (Logs method, URL, and time)
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
  next()
}
app.use(requestLogger)

// Route-level Middleware (Validates POST request body)
const validateUser = (req, res, next) => {
  const { name, role } = req.body
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' })
  }
  next()
}

// ==================== 2. ROUTING & REQUEST HANDLING ====================

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Express Server Running (Practical 08)' })
})

// GET with Query Parameter handling (e.g. /api/users?role=admin)
app.get('/api/users', (req, res) => {
  const { role } = req.query
  if (role) {
    const filteredUsers = users.filter(
      (u) => u.role.toLowerCase() === role.toLowerCase()
    )
    return res.json(filteredUsers)
  }
  res.json(users)
})

// GET with Route Parameter handling (req.params.id)
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id)
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})

// POST with Request Body handling (req.body) and validateUser middleware
app.post('/api/users', validateUser, (req, res) => {
  const { name, role } = req.body
  const newUser = { id: users.length + 1, name, role }
  users.push(newUser)

  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  })
})

// 404 Fallback Middleware (Handles undefined routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ==================== 3. SERVER LISTEN ====================
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
