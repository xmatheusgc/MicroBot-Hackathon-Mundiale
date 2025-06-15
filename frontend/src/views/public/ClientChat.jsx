import React, { useEffect } from "react";
import { Paperclip, Mic, Bot } from "lucide-react";
import { chatService } from "../../services/chatService.js";

export default function ClientChat() {
  const chatId = "chat1"; // ou "chat2"
  const {
    message,
    setMessage,
    history,
    loading,
    handleSend,
    messagesEndRef
  } = chatService(chatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleFileClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Arquivo selecionado:", file.name);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-color text-[#e5e5e5]">
      <div className="flex flex-col flex-grow items-center px-4 py-6 overflow-y-auto">
        <div className="bg-surface h-full rounded-4xl px-6 py-4 w-full max-w-[800px] overflow-y-auto space-y-4 max-h-[730px] shadow-2xl">
          {history.map((msg, index) => {
            if (msg.role === "model") {
              return (
                <div key={index} className="flex items-start">
                  <div className="mr-3 text-[32px] shrink-0 text-purple">
                    <Bot size={32} />
                  </div>
                  <div className="bg-surface px-6 py-4 rounded-3xl shadow-2xl input-color max-w-1/2">
                    {msg.parts[0].text.split("\n").map((line, i) => (
                      <p key={i} className="leading-relaxed text-color mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
            }

            // NOVO: renderizar mensagens do agente/admin
            if (msg.role === "agent") {
              return (
                <div key={index} className="flex items-start">
                  <div className="mr-3 text-[32px] shrink-0 text-green-600">
                    {/* Ícone diferente para agente, se quiser */}
                    <Bot size={32} />
                  </div>
                  <div className="bg-green-100 px-6 py-4 rounded-3xl shadow-2xl text-green-900 max-w-1/2">
                    {msg.parts[0].text.split("\n").map((line, i) => (
                      <p key={i} className="leading-relaxed mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
            }

            // Mensagens do próprio cliente
            return (
              <div
                key={index}
                className="flex justify-end"
              >
                <div className="my-2 p-3 rounded-xl max-w-[70%] break-words shadow-lg bg-purple text-white max-w-1/2">
                  {msg.parts[0].text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) handleSend();
        }}
        className="flex bg-surface items-center gap-2 p-3 pr-3 rounded-4xl w-full max-w-[800px] self-center mb-6 shadow-2xl"
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

          <div
            className="w-9 h-9 flex items-center justify-center rounded-full text-purple transition cursor-pointer shadow-[0_-1px_7px_rgba(0,0,0,0.1)] hover:bg-[#737FEB] hover:!text-white"
            title="Ditar"
          >
            <Mic size={18} />
          </div>
        </div>

        <input
          type="text"
          placeholder="Mensagem para o Copilot"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
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
    </div>
  );
}