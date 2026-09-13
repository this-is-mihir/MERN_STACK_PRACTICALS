import { useState } from 'react'
import './App.css'

function App() {
  const [student, setStudent] = useState({
    name: '',
    email: '',
    course: '',
    age: '',
  })

  const [students, setStudents] = useState([])
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setStudent({
      ...student,
      [name]: value,
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (student.name.trim() === '') {
      newErrors.name = 'Full name is required.'
    }

    if (student.email.trim() === '') {
      newErrors.email = 'Email address is required.'
    } else if (!student.email.includes('@')) {
      newErrors.email = 'Please enter a valid email.'
    }

    if (student.course === '') {
      newErrors.course = 'Please choose a course.'
    }

    if (student.age === '') {
      newErrors.age = 'Age is required.'
    } else if (student.age < 18 || student.age > 35) {
      newErrors.age = 'Age must be between 18 and 35.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (validateForm()) {
      const newStudent = {
        id: Date.now(),
        ...student,
      }

      setStudents([...students, newStudent])
      setStudent({
        name: '',
        email: '',
        course: '',
        age: '',
      })
      setErrors({})
      alert('Registration successful!')
    }
  }

  const removeStudent = (id) => {
    setStudents(students.filter((s) => s.id !== id))
  }

  return (
    <div className="app">
      <h1>Student Registration Portal</h1>

      <div className="form-container">
        <h2>New Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={student.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={student.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Course</label>
            <select
              name="course"
              value={student.course}
              onChange={handleChange}
            >
              <option value="">Choose Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="BBA">BBA</option>
              <option value="MBA">MBA</option>
            </select>
            {errors.course && <p className="error">{errors.course}</p>}
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={student.age}
              onChange={handleChange}
              placeholder="Enter age"
            />
            {errors.age && <p className="error">{errors.age}</p>}
          </div>

          <button type="submit" className="register-button">
            Register Student
          </button>
        </form>
      </div>

      <div className="student-list">
        <h2>Registered Students</h2>

        {students.length === 0 ? (
          <p className="empty-message">No registrations yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Age</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.course}</td>
                    <td>{s.age}</td>
                    <td>
                      <button
                        className="remove-button"
                        onClick={() => removeStudent(s.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App