import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './App.css'

function Home() {
  return (
    <div className="page">
      <h1>Discover Indian Cuisine</h1>
      <p>
        Welcome to the ultimate guide for exploring India's diverse and flavorful food culture.
      </p>
      <p>
        Use the navigation menu above to browse famous dishes, explore food-famous states, and learn more about our platform.
      </p>
    </div>
  )
}

function Dishes() {
  const dishesList = [
    { name: 'Biryani', state: 'Hyderabad' },
    { name: 'Butter Chicken', state: 'Punjab' },
    { name: 'Dosa', state: 'Karnataka' },
  ]

  return (
    <div className="page">
      <h1>Famous Dishes</h1>

      <div className="card-container">
        {dishesList.map((item, index) => (
          <div className="card" key={index}>
            <h3>{item.name}</h3>
            <p>Origin: {item.state}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function States() {
  return (
    <div className="page">
      <h1>Food Famous States</h1>

      <div className="card-container">

        <div className="card">
          <h3>Punjab</h3>
          <p>Known for rich buttery dishes, tandoori flavors, and hearty meals.</p>
        </div>

        <div className="card">
          <h3>Gujarat</h3>
          <p>Famous for its sweet and savory snacks, dhokla, and thepla.</p>
        </div>

        <div className="card">
          <h3>Kerala</h3>
          <p>Home to coconut-based curries, appam, and fresh seafood delicacies.</p>
        </div>
      </div>
    </div>
  )
}

function About() {
  return (
    <div className="page">
      <h1>About Us</h1>

      <p>
        This application is built using React and React Router for seamless single-page navigation.
      </p>

      <p>
        It demonstrates multi-page routing with clean component composition and responsive design.
      </p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="page">
      <h1>404</h1>
      <p>Page Not Found</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h2>Indian Cuisine Guide</h2>

          <div className="nav-links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/dishes">Dishes</NavLink>
            <NavLink to="/states">States</NavLink>
            <NavLink to="/about">About</NavLink>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dishes" element={<Dishes />} />
            <Route path="/states" element={<States />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App