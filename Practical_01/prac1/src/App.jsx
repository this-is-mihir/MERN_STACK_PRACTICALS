import './App.css'

function TempleCard({ name, location, deity, style }) {
  return (
    <div className="temple-card">
      <h2>{name}</h2>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Deity:</strong> {deity}</p>
      <p><strong>Style:</strong> {style}</p>
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <h1>Famous Indian Temples</h1>

      <div className="temple-container">
        <TempleCard
          name="Somnath Temple"
          location="Gujarat"
          deity="Lord Shiva"
          style="Chalukya Architecture"
        />

        <TempleCard
          name="Meenakshi Temple"
          location="Tamil Nadu"
          deity="Goddess Meenakshi"
          style="Dravidian Architecture"
        />

        <TempleCard
          name="Golden Temple"
          location="Punjab"
          deity="Guru Granth Sahib"
          style="Sikh Architecture"
        />
      </div>
    </div>
  )
}

export default App