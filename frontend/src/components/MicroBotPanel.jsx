import { useEffect, useState } from "react";
import { useWebSocket } from "../services/useWebSocket";
import { authFetch } from '../services/authFetch';

export default function MicroBotPanel({ activeChatId, setActiveChatId }) {
  const [chats, setChats] = useState([]);

  const fetchChats = () => {
    fetch("http://127.0.0.1:8000/chats")
      .then(res => res.json())
      .then(data => {
        setChats(data.chats.map(id => ({ id, title: id })));
      });
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useWebSocket((data) => {
    if (data.type === "new_chat") {
      fetchChats();
    }
  });

  return (
    <section className='flex flex-col justify-between grow-4 rounded-3xl bg-surface shadow-2xl px-4 py-6 h-full'>
      {chats.length === 0 && (
        <div className="text-gray-500">Nenhum chat ativo.</div>
      )}
      {chats.map(chat => (
        <div
          key={chat.id}
          className={`cursor-pointer p-2 rounded-md mb-2 ${activeChatId === chat.id ? 'bg-purple text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveChatId(chat.id)}
        >
          {chat.title}
        </div>
      ))}
    </section>
  );
}