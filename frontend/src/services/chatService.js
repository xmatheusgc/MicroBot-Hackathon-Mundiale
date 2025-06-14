import { useState, useRef, useEffect } from 'react';

export function chatService() {
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

    const userMessage = { role: 'user', parts: [{ text: message }] };
    setHistory(prev => [...prev, userMessage]);
    const messageToSend = message;
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageToSend, history }),
      });

      const data = await response.json();
      const modelResponse = {
        role: 'model',
        parts: [{ text: data.result || data.error || "Não recebi uma resposta válida." }],
      };

      setHistory(prev => [...prev, modelResponse]);
    } catch {
      setHistory(prev => [...prev, {
        role: 'model',
        parts: [{ text: "Erro de conexão com o servidor." }],
      }]);
    } finally {
      setLoading(false);
    }
  };

  return {
    message,
    setMessage,
    history,
    loading,
    handleSend,
    messagesEndRef
  };
}