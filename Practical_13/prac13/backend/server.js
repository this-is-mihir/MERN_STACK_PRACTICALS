const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 5005

// Middleware
app.use(cors())
app.use(express.json())

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir))

// ==================== 1. MONGODB CONNECTION ====================
const MONGO_URI = 'mongodb://127.0.0.1:27017/documentManagerDB'

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to documentManagerDB'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message))

// ==================== 2. MONGOOSE SCHEMA & MODEL ====================
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Financial', 'HR', 'Legal', 'General'],
    default: 'General'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Document = mongoose.model('Document', documentSchema)

// ==================== 3. MULTER CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
})

// ==================== 4. REST API ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Document Management System API is running' })
})

// POST: Upload document with metadata
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please choose a file to upload' })
    }

    const { title, category, description } = req.body
    if (!title || !title.trim()) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'Document title is required' })
    }

    const newDoc = new Document({
      title: title.trim(),
      category: category || 'General',
      description: description ? description.trim() : '',
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    })

    const savedDoc = await newDoc.save()
    res.status(201).json({
      message: 'Document uploaded and indexed successfully',
      document: savedDoc
    })
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ error: error.message })
  }
})

// GET: Fetch documents with optional category and search query
app.get('/api/documents', async (req, res) => {
  try {
    const { category, search } = req.query
    let filter = {}

    if (category && category !== 'All') {
      filter.category = category
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { originalName: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 })
    res.json(documents)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET: Summary statistics
app.get('/api/documents/stats', async (req, res) => {
  try {
    const totalDocs = await Document.countDocuments()
    const allDocs = await Document.find({}, 'fileSize category')

    const totalSize = allDocs.reduce((acc, doc) => acc + (doc.fileSize || 0), 0)

    const categories = ['Technical', 'Financial', 'HR', 'Legal', 'General']
    const categoryCounts = {}
    categories.forEach((cat) => {
      categoryCounts[cat] = allDocs.filter((d) => d.category === cat).length
    })

    res.json({
      totalDocs,
      totalSize, // bytes
      categoryCounts
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET: Download document file
app.get('/api/documents/download/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ error: 'File not found on server disk' })
    }

    res.download(doc.filePath, doc.originalName)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE: Remove document and delete file from disk
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id)
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // Delete file from disk if exists
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath)
    }

    res.json({
      message: 'Document deleted successfully',
      id: req.params.id
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ==================== 5. SERVER LISTEN ====================
app.listen(PORT, () => {
  console.log(`Document Management Server running at http://localhost:${PORT}`)
})
