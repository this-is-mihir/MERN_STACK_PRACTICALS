const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 5001

// Middleware to parse JSON
app.use(express.json())

// Serve uploaded files statically (optional preview)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ==================== 1. MONGODB CONNECTION ====================
const MONGO_URI = 'mongodb://127.0.0.1:27017/fileUploadDB'

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message))

// ==================== 2. MONGOOSE SCHEMA & MODEL ====================
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
})

const FileMetadata = mongoose.model('FileMetadata', fileSchema)

// ==================== 3. MULTER CONFIGURATION ====================
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// ==================== 4. ROUTES ====================

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Multer & MongoDB File Upload API is running' })
})

// POST: Upload single file and save metadata in MongoDB
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a file to upload' })
    }

    // Create file metadata document
    const newFile = new FileMetadata({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    })

    const savedFile = await newFile.save()

    res.status(201).json({
      message: 'File uploaded and metadata stored successfully',
      file: savedFile
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET: Retrieve all uploaded files metadata
app.get('/api/files', async (req, res) => {
  try {
    const files = await FileMetadata.find().sort({ uploadedAt: -1 })
    res.json(files)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET: Retrieve single file metadata by ID
app.get('/api/files/:id', async (req, res) => {
  try {
    const file = await FileMetadata.findById(req.params.id)
    if (!file) {
      return res.status(404).json({ error: 'File metadata not found' })
    }
    res.json(file)
  } catch (error) {
    res.status(500).json({ error: 'Invalid file ID or file not found' })
  }
})

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ==================== 5. SERVER LISTEN ====================
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
