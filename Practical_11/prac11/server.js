const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 5003
const JWT_SECRET = 'mern_blog_rbac_secret_key_123'

// Middleware to parse incoming JSON
app.use(express.json())

// ==================== 1. MONGODB CONNECTION ====================
const MONGO_URI = 'mongodb://127.0.0.1:27017/blogRbacDB'

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to blogRbacDB'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message))

// ==================== 2. SCHEMAS & MODELS ====================

// User Schema (with Roles: 'user' or 'admin')
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
})
const User = mongoose.model('User', userSchema)

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String },
  createdAt: { type: Date, default: Date.now }
})
const Blog = mongoose.model('Blog', blogSchema)

// ==================== 3. AUTH & RBAC MIDDLEWARES ====================

// Middleware: Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No token provided' })
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = decodedUser
    next()
  })
}

// Middleware: Role-Based Access Control (RBAC)
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: `Access denied: Requires '${requiredRole}' role permission`
      })
    }
    next()
  }
}

// ==================== 4. AUTHENTICATION ROUTES ====================

// Register New User (role can be 'user' or 'admin')
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user'
    })

    await newUser.save()
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login User & Generate JWT Token
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' })
    }

    // Generate JWT Token containing user id and role
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== 5. BLOG CRUD & RBAC ROUTES ====================

// GET: All Blogs (Public)
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 })
    res.json(blogs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET: Single Blog by ID (Public)
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }
    res.json(blog)
  } catch (error) {
    res.status(500).json({ error: 'Invalid blog ID' })
  }
})

// POST: Create Blog (Protected: Logged-in User or Admin)
app.post('/api/blogs', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    const newBlog = new Blog({
      title,
      content,
      author: req.user.id,
      authorName: req.user.name
    })

    const savedBlog = await newBlog.save()
    res.status(201).json({
      message: 'Blog created successfully',
      blog: savedBlog
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT: Update Blog (Protected: Only Author can update)
app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    // Check if the logged-in user is the author
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own blogs' })
    }

    const { title, content } = req.body
    if (title) blog.title = title
    if (content) blog.content = content

    const updatedBlog = await blog.save()
    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE: Delete Blog (RBAC: ONLY Admin can delete)
app.delete('/api/blogs/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id)
    if (!deletedBlog) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    res.json({
      message: 'Blog deleted successfully by Admin',
      blogId: req.params.id
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ==================== 6. SERVER LISTEN ====================
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
