import React, { useEffect, useState } from 'react';
import { chatService } from '../services/chatService';
import { Paperclip, Bot, Pin, Power, SquareUser } from "lucide-react";
import { useWebSocket } from "../services/useWebSocket";

export default function AdminChatComponent({ activeChatId }) {
  const [iaOn, setIaOn] = useState(true);
  const {
    message,
    setMessage,
    history,
    setHistory,
    loading,
    handleSend,
    messagesEndRef,
    fetchHistory, 
  } = chatService(activeChatId);

  useEffect(() => {
    if (!activeChatId) return;
    fetch(`http://127.0.0.1:8000/get-ia-status?chatId=${activeChatId}`)
      .then(res => res.json())
      .then(data => setIaOn(data.iaOn));
  }, [activeChatId]);

  const toggleIa = async () => {
    if (!activeChatId) return;
    const novoStatus = !iaOn;
    setIaOn(novoStatus);
    await fetch('http://127.0.0.1:8000/set-ia-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: activeChatId, iaOn: novoStatus }),
    });
  };

  const handleSendWithIaToggle = async () => {
    if (!message.trim() || loading) return;

    try {
      await fetch('http://127.0.0.1:8000/manual-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChatId, message }),
      });
      setMessage('');
    } catch (err) {
      console.error('Erro ao enviar resposta manual:', err);
    }
  };

  const handleFileClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Arquivo selecionado:", file.name);
    }
  };

  useWebSocket((data) => {
    if (data.type === "new_message" && data.chatId === activeChatId) {
      fetchHistory(); 
    }
  });

  return (
    <section className="flex flex-col justify-between grow-1 rounded-3xl bg-surface shadow-2xl px-4 py-2 h-full max-w-1/3 min-w-[420px] max-h-[799px]">
      <div className="flex justify-start mb-4">
        <button 
          className="ml-2 px-4 py-3 bg-red text-white font-semibold rounded-4xl hover:bg-[#555] transition disabled:bg-gray-400 cursor-pointer">
            <Power size={20}/>
        </button>
        <button 
          className="ml-2 px-4 py-3 bg-purple text-white font-semibold rounded-4xl hover:bg-[#555] transition disabled:bg-gray-400 cursor-pointer">
            <Pin size={20}/>
        </button>
        <button
          onClick={toggleIa}
          className={`px-4 ml-2 py-2 rounded-4xl font-semibold shadow transition cursor-pointer
            ${iaOn ? "bg-green text-white hover:bg-green-700" : "bg-gray-400 text-white hover:bg-gray-500"}`}>
            IA {iaOn ? "Ligada" : "Desligada"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 border rounded-3xl border-color max-h-[680px] px-4 py-2">
        {history.map((msg, index) => {
          if (msg.role === "model") {
            return (
              <div key={index} className="flex justify-end">
                <div className="bg-surface px-6 py-4 rounded-3xl shadow-2xl input-color max-w-1/2">
                  {msg.parts[0].text.split("\n").map((line, i) => (
                    <p key={i} className="leading-relaxed text-color mb-2">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="ml-3 text-[32px] shrink-0 text-purple">
                  <Bot size={30} />
                </div>
              </div>
            );
          }
          if (msg.role === "agent") {
            return (
              <div key={index} className="flex justify-end">
                <div className="bg-green-100 px-6 py-4 rounded-3xl shadow-2xl text-green-900 max-w-1/2">
                  {msg.parts[0].text.split("\n").map((line, i) => (
                    <p key={i} className="leading-relaxed mb-2">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="ml-3 text-[32px] shrink-0 text-green-600">
                  <SquareUser size={30}/>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="flex justify-start">
              <div className="my-2 p-3 rounded-xl max-w-[70%] break-words shadow-lg bg-purple text-white max-w-1/2">
                {msg.parts[0].text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!loading) handleSendWithIaToggle();
        }}
        className="flex items-center gap-2 mt-2"
      >
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex gap-2 ml-2 items-center">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-full text-purple transition cursor-pointer shadow-[0_-1px_7px_rgba(0,0,0,0.1)] hover:bg-[#737FEB] hover:!text-white"
            title="Anexar arquivo"
            onClick={handleFileClick}
          >
            <Paperclip size={18} />
          </div>
        </div>
        <input
          type="text"
          placeholder="Mensagem para o cliente"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="flex-grow p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"
        />
        <button
          type="submit"
          title="Enviar mensagem"
          disabled={loading || !message.trim()}
          className="ml-2 px-5 py-3 bg-purple text-white font-semibold rounded-4xl hover:bg-[#555] transition disabled:bg-gray-400"
        >
          {loading ? "..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}