import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { authFetch } from './authFetch';

export function chatService(activeChatId) {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Busca o histórico do chat
  const fetchHistory = async () => {
    if (!activeChatId) return;
    try {
      const res = await authFetch(`http://127.0.0.1:8000/history?chatId=${activeChatId}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    if (!activeChatId) return;
    fetchHistory();
    // Removido o setInterval (polling)
  }, [activeChatId]);

  // Atualiza histórico em tempo real via WebSocket
  useWebSocket((data) => {
    if (data.type === "new_message" && data.chatId === activeChatId) {
      fetchHistory();
    }
  });

  const handleSend = async () => {
    if (!message.trim() || !activeChatId) return;
    setLoading(true);

    const userMessage = { role: 'user', parts: [{ text: message }] };
    setHistory(prev => [...prev, userMessage]);
    const messageToSend = message;
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChatId, prompt: messageToSend }),
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
    setHistory,
    loading,
    handleSend,
    messagesEndRef,
    fetchHistory, // exporta para uso externo (AdminChatComponent)
  };
}