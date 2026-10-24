import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5002/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // 1. Fetch all tasks from Express Backend
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_URL)
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setStatusMessage('Error connecting to backend server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // 2. Add a new task (POST)
  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })

      if (res.ok) {
        setTitle('')
        fetchTasks()
        setStatusMessage('Task added successfully!')
        setTimeout(() => setStatusMessage(''), 3000)
      }
    } catch (err) {
      console.error('Failed to add task:', err)
      setStatusMessage('Error adding task.')
    }
  }

  // 3. Delete a task (DELETE)
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setTasks(tasks.filter((task) => task._id !== id))
        setStatusMessage('Task deleted successfully!')
        setTimeout(() => setStatusMessage(''), 3000)
      }
    } catch (err) {
      console.error('Failed to delete task:', err)
      setStatusMessage('Error deleting task.')
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <header className="header">
          <h1>MERN Task Manager</h1>
          <p className="subtitle">Practical 10: React + Express + MongoDB</p>
        </header>

        {statusMessage && <div className="alert">{statusMessage}</div>}

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="task-form">
          <input
            type="text"
            placeholder="Enter a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="task-input"
          />
          <button type="submit" className="add-btn">
            Add Task
          </button>
        </form>

        {/* Task List */}
        <div className="task-section">
          <h2>Your Tasks ({tasks.length})</h2>

          {loading ? (
            <p className="loading-text">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-text">No tasks yet. Add your first task above!</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task._id} className="task-item">
                  <div className="task-info">
                    <span className="task-title">{task.title}</span>
                    <span className="task-date">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="delete-btn"
                    title="Delete task"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
