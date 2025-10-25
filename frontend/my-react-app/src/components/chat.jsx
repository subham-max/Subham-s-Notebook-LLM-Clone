// components/chat.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chat = ({ documentId, filename, onCitationClick }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: `Hello! I've loaded "${filename}". Ask me anything about the document!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const response = await axios.post(
        `http://localhost:5001/api/documents/${documentId}/query`,
        { question: input }
      );

      const botMessage = {
        type: 'bot',
        content: response.data.answer || 'No answer.',
        citations: response.data.citations || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat with "{filename}"</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, idx) => (
          <div key={idx} className={`message ${message.type}-message`}>
            {message.type === 'user' ? (
              <div className="message-text">{message.content}</div>
            ) : (
              <div className="message-text">
                <RenderedMessage 
                  content={message.content} 
                  citations={message.citations}
                  onCitationClick={onCitationClick}
                />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="message bot-message">
            <div className="message-text">Thinking...</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          placeholder="Ask about the document..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={!input.trim() || loading}>
          Send
        </button>
      </div>
    </div>
  );
};

// RENDER MESSAGE WITH CLICKABLE CITATIONS
const RenderedMessage = ({ content, citations = [], onCitationClick }) => {
  const parts = content.split(/(\[Page \d+\])/g);

  return (
    <span>
      {parts.map((part, i) => {
        const match = part.match(/\[Page (\d+)\]/);
        if (match) {
          const pageNum = parseInt(match[1]);
          return (
            <button
              key={i}
              onClick={() => onCitationClick(pageNum)}
              className="citation-btn"
            >
              Page {pageNum}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}

      {/* SAFE: citations?.map */}
      {citations?.map((cit, i) => (
        <button
          key={`c${i}`}
          onClick={() => onCitationClick(cit.pages[0])}
          className="citation-inline"
        >
          [{cit.pages[0]}]
        </button>
      ))}
    </span>
  );
};

export default Chat;