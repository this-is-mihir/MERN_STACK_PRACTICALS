import { useState } from 'react'
import './App.css'

function FoodCard({ dishName, city, price }) {
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    setCount(count + 1)
  }

  const handleDecrement = () => {
    if (count > 0) {
      setCount(count - 1)
    }
  }

  const handleOrder = () => {
    if (count > 0) {
      alert(`Order placed for ${count} plate(s) of ${dishName}!`)
    } else {
      alert('Please select quantity first.')
    }
  }

  return (
    <div className="food-card">
      <h2>{dishName}</h2>
      <p className="city"><strong>City:</strong> {city}</p>
      <p className="price">₹{price}</p>

      <div className="quantity-section">
        <button onClick={handleDecrement}>−</button>
        <span>{count}</span>
        <button onClick={handleIncrement}>+</button>
      </div>

      <p className="total-text">
        Total: <strong>₹{price * count}</strong>
      </p>

      <button className="order-button" onClick={handleOrder}>
        Place Order
      </button>
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <h1>Famous Indian Street Food</h1>
      <p className="subtitle">
        Props, State Management and Event Handling Demo
      </p>

      <div className="food-container">
        <FoodCard
          dishName="Vada Pav"
          city="Mumbai"
          price={40}
        />

        <FoodCard
          dishName="Chole Bhature"
          city="Delhi"
          price={120}
        />

        <FoodCard
          dishName="Poha Jalebi"
          city="Indore"
          price={60}
        />
      </div>
    </div>
  )
}

export default App