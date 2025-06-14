// ChatWindow.js
import React, { useState, useRef, useEffect } from 'react';

export default function ChatWindow() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]); 
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);


  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);

    const userMessage = {
      role: 'user',
      parts: [{ text: message }],
    };
    
    setHistory(prevHistory => [...prevHistory, userMessage]);
    
    const messageToSend = message; 
    
    setMessage(''); 

    try {
      const response = await fetch('http://127.0.0.1:8000/processar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: messageToSend, 
          history: history 
        }),
      });
      
      const data = await response.json();

      const modelResponse = {
        role: 'model',
        parts: [{ text: data.resultado || data.erro || "Não recebi uma resposta válida." }],
      };
      
      setHistory(prevHistory => [...prevHistory, modelResponse]);

    } catch (error) {
      const errorResponse = {
        role: 'model',
        parts: [{ text: "Erro de conexão com o servidor." }],
      };
      setHistory(prevHistory => [...prevHistory, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='flex flex-col justify-between grow-1 rounded-3xl bg-surface shadow-2xl p-4 h-[80vh]'>
      <div className='chat-header font-bold text-lg mb-2'>
        MicroBot
      </div>

      <div className='messages-container flex flex-col p-4 h-full overflow-y-auto border rounded-lg'>
        {history.map((msg, index) => (
          <div 
            key={index} 
            className={`my-2 p-3 rounded-xl max-w-xl break-words ${
              msg.role === 'user' 
                ? 'bg-purple text-white self-end' 
                : 'bg-gray-200 text-black self-start'
            }`}
          >
            {msg.parts[0].text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className='flex chat-tools gap-2 justify-center p-2 mt-2'>
        <input 
          className='rounded-xl px-4 py-2 w-full border focus:outline-none focus:ring-2 focus:ring-purple' 
          type="text" 
          placeholder='Escreva sua mensagem...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()} 
        />
        <button 
          className='rounded-xl px-6 py-2 bg-purple text-white font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400'
          onClick={handleSend}
          disabled={loading || !message.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </section>
  );
}