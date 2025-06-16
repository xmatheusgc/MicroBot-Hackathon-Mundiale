import { useEffect, useState } from "react";
import { useWebSocket } from "../services/useWebSocket";
import { authFetch } from '../services/authFetch';
import { Pin } from "lucide-react";
import { getUserRole } from "../services/auth";

const username = (() => {
  const token = localStorage.getItem("token");
  if (!token) return "";
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.sub || "";
  } catch {
    return "";
  }
})();

export default function MicroBotPanel({ activeChatId, setActiveChatId }) {
  const [chats, setChats] = useState([]);
  const [stats, setStats] = useState({ open: 0, closed_24h: 0, opened_24h: 0 });
  const [pinned, setPinned] = useState([]);

  useEffect(() => {
    const pins = JSON.parse(localStorage.getItem(`pinnedChats-${username}`) || "[]");
    setPinned(pins);
  }, [username]);

  const savePinned = (pins) => {
    setPinned(pins);
    localStorage.setItem(`pinnedChats-${username}`, JSON.stringify(pins));
  };

  const fetchChats = () => {
    authFetch("http://127.0.0.1:8000/chats")
      .then(res => res.json())
      .then(data => {
        setChats(data.chats);
      });
  };

  const fetchStats = () => {
    authFetch("http://127.0.0.1:8000/chat-stats")
      .then(res => res.json())
      .then(data => setStats(data));
  };

  useEffect(() => {
    fetchChats();
    fetchStats();
  }, []);

  useWebSocket((data) => {
    if (
      data.type === "new_chat" ||
      data.type === "new_message" ||
      data.type === "chat_closed"
    ) {
      fetchChats();
      fetchStats();
    }
  });

  const togglePin = (chatId) => {
    let pins = [...pinned];
    if (pins.includes(chatId)) {
      pins = pins.filter(id => id !== chatId);
    } else {
      pins.push(chatId);
    }
    savePinned(pins);
  };

  const sortedChats = [
    ...chats.filter(c => pinned.includes(c.chat_id)),
    ...chats.filter(c => !pinned.includes(c.chat_id))
  ];

  return (
    <section className='flex flex-col grow-4 rounded-3xl bg-surface shadow-2xl px-4 py-6 h-full gap-4'>
      <div className="border rounded-xl border-color px-4 py-3 grow-4 flex flex-col gap-2">
        <div className="font-bold text-lg text-purple">Estatísticas (últimas 24h)</div>
        <div className="text-color">Chats abertos: <span className="font-bold">{stats.opened_24h}</span></div>
        <div className="text-color">Resolvidos: <span className="font-bold">{stats.closed_24h}</span></div>
        <div className="text-color">Em andamento: <span className="font-bold">{stats.open}</span></div>
      </div>
      <div className="border rounded-xl border-color px-1 py-3 grow-1 overflow-y-auto max-h-2/5">
        {sortedChats.length === 0 && (
          <div className="text-secondary m-5">Nenhum chat ativo.</div>
        )}
        {sortedChats.map(chat => (
          <div
            key={chat.chat_id}
            className={`cursor-pointer p-2 rounded-md mb-2 flex items-center justify-between ${activeChatId === chat.chat_id ? 'bg-purple text-white' : 'input-color'}`}
            onClick={() => setActiveChatId(chat.chat_id)}
          >
            <div>
              <div className="font-bold text-color">{chat.chat_id}</div>
              <div className="font-bold text-color">Cliente: {chat.username}</div>
              <div className="text-xs text-gray-700 truncate text-color">Última: {chat.last_message}</div>
              <div className={`text-xs ${chat.online ? "text-green" : "text-red"}`}>
                {chat.online ? "• Online" : "× Offline"}
              </div>
            </div>
            <div className="flex flex-col gap-2 ml-2">
              <button
                title={pinned.includes(chat.chat_id) ? "Desafixar" : "Fixar"}
                className={`p-1 rounded-full cursor-pointer ${pinned.includes(chat.chat_id) ? "bg-purple text-white" : "bg-surface text-purple"}`}
                onClick={e => { e.stopPropagation(); togglePin(chat.chat_id); }}
              >
                <Pin size={18} fill={pinned.includes(chat.chat_id) ? "#737FEB" : "none"} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}