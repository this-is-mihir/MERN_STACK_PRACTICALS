import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_SERVER_URL = 'http://localhost:5004'

function App() {
  const [socket, setSocket] = useState(null)
  const [username, setUsername] = useState('')
  const [joined, setJoined] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  const messagesEndRef = useRef(null)

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize Socket Connection when user joins
  useEffect(() => {
    if (!joined) return

    const newSocket = io(SOCKET_SERVER_URL)
    setSocket(newSocket)

    // Listen for incoming messages
    newSocket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data])
    })

    return () => {
      newSocket.disconnect()
    }
  }, [joined])

  // Handle Join
  const handleJoin = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setJoined(true)
    }
  }

  // Handle Send Message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim() || !socket) return

    const messageData = {
      id: Date.now(),
      sender: username,
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Emit message to server
    socket.emit('send_message', messageData)
    setMessage('')
  }

  return (
    <div className="chat-app">
      {!joined ? (
        /* Join Room Card */
        <div className="join-card">
          <h2>Real-Time Chat</h2>
          <p>Practical 12: Socket.IO + React + Node.js</p>
          <form onSubmit={handleJoin} className="join-form">
            <input
              type="text"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="chat-input"
              required
            />
            <button type="submit" className="primary-btn">
              Join Chat
            </button>
          </form>
        </div>
      ) : (
        /* Chat Window */
        <div className="chat-box">
          {/* Header */}
          <div className="chat-header">
            <div className="user-status">
              <span className="status-dot"></span>
              <div>
                <h3>Global Chat Room</h3>
                <span className="current-user">Logged in as: <strong>{username}</strong></span>
              </div>
            </div>
            <button
              onClick={() => {
                setJoined(false)
                setMessages([])
              }}
              className="leave-btn"
            >
              Leave
            </button>
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="no-messages">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === username
                return (
                  <div
                    key={msg.id}
                    className={`message-wrapper ${isMe ? 'message-outgoing' : 'message-incoming'}`}
                  >
                    {!isMe && <span className="sender-name">{msg.sender}</span>}
                    <div className="message-bubble">
                      <p className="message-text">{msg.text}</p>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSendMessage} className="chat-footer">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="primary-btn">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
