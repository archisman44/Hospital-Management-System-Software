import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your medical assistant. How can I help you today?' }
  ]);
  const [text, setText] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (text.trim()) {
      setMessages((msgs) => [...msgs, { sender: 'user', text }]);
      // Placeholder bot response logic
      setTimeout(() => {
        setMessages(msgs => [
          ...msgs,
          { sender: 'bot', text: "I'm a demo bot. Please connect a medical AI backend for real assistance." }
        ]);
      }, 600);
      setText('');
    }
  };

  return (
    <div className="container">
      <h2>Medical Chatbot</h2>
      <div
        ref={chatRef}
        style={{
          border: '1px solid #bbb',
          padding: 12,
          height: 320,
          overflowY: 'auto',
          marginBottom: 12,
          background: '#f9fafd'
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            margin: '8px 0'
          }}>
            <span
              style={{
                display: 'inline-block',
                background: msg.sender === 'user' ? '#1976d2' : '#eee',
                color: msg.sender === 'user' ? '#fff' : '#222',
                borderRadius: 16,
                padding: '8px 14px',
                maxWidth: '80%',
                wordBreak: 'break-word'
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #bbb' }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}