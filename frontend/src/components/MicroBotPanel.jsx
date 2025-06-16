import { useEffect, useState } from "react";
import { useWebSocket } from "../services/useWebSocket";
import { authFetch } from '../services/authFetch';

export default function MicroBotPanel({ activeChatId, setActiveChatId }) {
  const [chats, setChats] = useState([]);

  const fetchChats = () => {
    authFetch("http://127.0.0.1:8000/chats")
      .then(res => res.json())
      .then(data => {
        setChats(data.chats);
      });
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useWebSocket((data) => {
    if (data.type === "new_chat" || data.type === "new_message") {
      fetchChats();
    }
  });

  return (
    <section className='flex flex-col grow-4 rounded-3xl bg-surface shadow-2xl px-4 py-6 h-full gap-4'>
      <div className="border rounded-xl border-color px-1 py-3 grow-4"></div>
      <div className="border rounded-xl border-color px-1 py-3 grow-1 overflow-y-auto max-h-/5">
        {chats.length === 0 && (
          <div className="text-secondary m-5">Nenhum chat ativo.</div>
        )} {chats.map(chat => (
          <div
            key={chat.chat_id}
            className={`cursor-pointer p-2 rounded-md mb-2 ${activeChatId === chat.chat_id ? 'bg-purple text-white' : 'input-color'}`}
            onClick={() => setActiveChatId(chat.chat_id)}
          >
            <div className="font-bold text-color">{chat.chat_id}</div>
            <div className="font-bold text-color">Cliente: {chat.username}</div>
            <div className="text-xs text-gray-700 truncate text-color">Última: {chat.last_message}</div>
            <div className={`text-xs ${chat.online ? "text-green" : "text-red"}`}>
              {chat.online ? "• Online" : "× Offline"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}