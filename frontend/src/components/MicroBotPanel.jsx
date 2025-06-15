import { useEffect, useState } from "react";

export default function MicroBotPanel({ activeChatId, setActiveChatId }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Função para buscar chats
    const fetchChats = () => {
      fetch("http://127.0.0.1:8000/chats")
        .then(res => res.json())
        .then(data => {
          setChats(data.chats.map(id => ({ id, title: id })));
        });
    };

    fetchChats(); // Busca inicial

    // Atualiza a cada 5 segundos
    const interval = setInterval(fetchChats, 5000);

    // Limpa o intervalo ao desmontar
    return () => clearInterval(interval);
  }, []);

  return (
    <section className='flex flex-col justify-between grow-4 rounded-3xl bg-surface shadow-2xl px-4 py-2 h-full'>
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
