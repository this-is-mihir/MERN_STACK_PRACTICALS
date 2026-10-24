const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5004

// Middleware
app.use(cors())
app.use(express.json())

// Create HTTP Server
const server = http.createServer(app)

// Initialize Socket.IO Server with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Root Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'Socket.IO Real-Time Chat Server is running' })
})

// Socket.IO Connection Event
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Listen for 'send_message' from client
  socket.on('send_message', (data) => {
    // Broadcast received message to all connected clients
    io.emit('receive_message', data)
  })

  // Listen for user disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

// Start Server
server.listen(PORT, () => {
  console.log(`Chat Server running at http://localhost:${PORT}`)
})
