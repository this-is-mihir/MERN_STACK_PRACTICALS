import React, { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:5005/api/documents'

const CATEGORIES = ['All', 'Technical', 'Financial', 'HR', 'Legal', 'General']

function App() {
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({ totalDocs: 0, totalSize: 0, categoryCounts: {} })
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' })

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory)
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim())

      const res = await fetch(`${API_BASE}?${queryParams.toString()}`)
      const data = await res.json()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  useEffect(() => {
    fetchDocuments()
    fetchStats()
  }, [selectedCategory])

  // Trigger search on submit or debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchDocuments()
  }

  // Handle document upload
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setStatusMessage({ text: 'Please select a file to upload.', type: 'error' })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('title', title)
      formData.append('category', category)
      formData.append('description', description)
      formData.append('file', file)

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setStatusMessage({ text: 'Document uploaded successfully!', type: 'success' })
        setTitle('')
        setCategory('General')
        setDescription('')
        setFile(null)
        // Reset file input in DOM
        e.target.reset()
        fetchDocuments()
        fetchStats()
      } else {
        setStatusMessage({ text: data.error || 'Upload failed', type: 'error' })
      }
    } catch (err) {
      setStatusMessage({ text: 'Error connecting to server', type: 'error' })
    } finally {
      setUploading(false)
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000)
    }
  }

  // Handle document delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setStatusMessage({ text: 'Document deleted successfully!', type: 'success' })
        fetchDocuments()
        fetchStats()
      }
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  // Helper: Format bytes to human readable string
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper: File Type Badge
  const getFileBadge = (mime) => {
    if (mime.includes('pdf')) return { label: 'PDF', color: 'badge-red' }
    if (mime.includes('word') || mime.includes('officedocument')) return { label: 'DOC', color: 'badge-blue' }
    if (mime.includes('image')) return { label: 'IMG', color: 'badge-green' }
    return { label: 'FILE', color: 'badge-purple' }
  }

  return (
    <div className="dms-app">
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">📁</div>
          <div>
            <h1>DocuVault DMS</h1>
            <span className="subtitle">Practical 13: Full-Stack MERN Application</span>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search documents by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">Search</button>
        </form>
      </header>

      {/* Main Content Container */}
      <main className="container">
        {/* Status Notification */}
        {statusMessage.text && (
          <div className={`alert-box alert-${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {/* Dashboard Analytics Cards */}
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Documents</span>
            <span className="stat-value">{stats.totalDocs || 0}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Storage Used</span>
            <span className="stat-value">{formatBytes(stats.totalSize)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Selected Category</span>
            <span className="stat-value">{selectedCategory}</span>
          </div>
        </section>

        {/* Dashboard Layout: Left Form + Right Library */}
        <div className="dashboard-grid">
          {/* Upload Document Panel */}
          <section className="panel upload-panel">
            <h2>Upload New Document</h2>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label>Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Financial Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief summary of document content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Select File (PDF, DOCX, TXT, IMG) *</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>

              <button type="submit" disabled={uploading} className="btn-upload">
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </section>

          {/* Document Library Panel */}
          <section className="panel library-panel">
            <div className="library-header">
              <h2>Document Library ({documents.length})</h2>
              {/* Category Filter Pills */}
              <div className="category-pills">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Cards */}
            {loading ? (
              <p className="loading-state">Loading documents...</p>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <p>No documents found matching the criteria.</p>
                <small>Upload your first document using the form on the left!</small>
              </div>
            ) : (
              <div className="documents-list">
                {documents.map((doc) => {
                  const badge = getFileBadge(doc.mimeType)
                  return (
                    <div key={doc._id} className="document-card">
                      <div className="doc-header">
                        <span className={`file-badge ${badge.color}`}>{badge.label}</span>
                        <div className="doc-main-info">
                          <h3 className="doc-title">{doc.title}</h3>
                          <span className="doc-category">{doc.category}</span>
                        </div>
                      </div>

                      {doc.description && <p className="doc-desc">{doc.description}</p>}

                      <div className="doc-meta">
                        <span>Original: {doc.originalName}</span>
                        <span>Size: {formatBytes(doc.fileSize)}</span>
                        <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="doc-actions">
                        <a
                          href={`${API_BASE}/download/${doc._id}`}
                          className="btn-download"
                          download
                        >
                          Download
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
