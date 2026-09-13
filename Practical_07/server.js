const express = require('express')

const app = express()

const PORT = 4500


app.use(express.json())


let students = [
  {
    id: 1,
    name: 'Vikram Mehta',
    email: 'vikram@gmail.com',
    course: 'B.Tech'
  },
  {
    id: 2,
    name: 'Ananya Iyer',
    email: 'ananya@gmail.com',
    course: 'M.Tech'
  },
  {
    id: 3,
    name: 'Karan Desai',
    email: 'karan@gmail.com',
    course: 'MBA'
  }
]


app.get('/', (req, res) => {
  res.json({
    message: 'Student Records REST API is running'
  })
})


app.get('/api/students', (req, res) => {
  res.json(students)
})


app.get('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id)

  const student = students.find(
    (student) => student.id === id
  )

  if (!student) {
    return res.status(404).json({
      message: 'Student not found'
    })
  }

  res.json(student)
})


app.post('/api/students', (req, res) => {
  const { name, email, course } = req.body

  if (!name || !email || !course) {
    return res.status(400).json({
      message: 'Name, email and course are required'
    })
  }

  const newStudent = {
    id: students.length + 1,
    name,
    email,
    course
  }

  students.push(newStudent)

  res.status(201).json({
    message: 'Student added successfully',
    student: newStudent
  })
})


app.put('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id)

  const student = students.find(
    (student) => student.id === id
  )

  if (!student) {
    return res.status(404).json({
      message: 'Student not found'
    })
  }

  const { name, email, course } = req.body

  if (name) student.name = name
  if (email) student.email = email
  if (course) student.course = course

  res.json({
    message: 'Student updated successfully',
    student
  })
})


app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id)

  const studentIndex = students.findIndex(
    (student) => student.id === id
  )

  if (studentIndex === -1) {
    return res.status(404).json({
      message: 'Student not found'
    })
  }

  const deletedStudent = students.splice(
    studentIndex,
    1
  )

  res.json({
    message: 'Student deleted successfully',
    student: deletedStudent[0]
  })
})


app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  })
})


app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  )
})