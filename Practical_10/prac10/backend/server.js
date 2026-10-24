const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5002

// Middleware
app.use(cors())
app.use(express.json())

// ==================== 1. MONGODB CONNECTION ====================
const MONGO_URI = 'mongodb://127.0.0.1:27017/mernTaskDB'

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to mernTaskDB'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message))

// ==================== 2. MONGOOSE SCHEMA & MODEL ====================
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Task = mongoose.model('Task', taskSchema)

// ==================== 3. REST API ROUTES ====================

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'MERN Task Manager API is running' })
})

// GET: Fetch all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST: Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' })
    }

    const newTask = new Task({ title: title.trim() })
    const savedTask = await newTask.save()

    res.status(201).json({
      message: 'Task added successfully',
      task: savedTask
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE: Remove a task by ID
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id)
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json({
      message: 'Task deleted successfully',
      taskId: req.params.id
    })
  } catch (error) {
    res.status(500).json({ error: 'Invalid task ID' })
  }
})

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ==================== 4. SERVER LISTEN ====================
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
