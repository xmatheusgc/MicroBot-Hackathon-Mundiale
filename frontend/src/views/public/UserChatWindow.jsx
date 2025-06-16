import React, { useEffect, useState } from "react";
import { Paperclip, Mic, Bot, SquareUser, Send, Ellipsis } from "lucide-react";
import { chatService } from "../../services/chatService.js";
import { authFetch } from "../../services/authFetch.js";

export default function ClientChat() {
  const [activeChatId, setActiveChatId] = useState(() => localStorage.getItem("activeChatId") || null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [lastChatId, setLastChatId] = useState(null);
  const {
    message,
    setMessage,
    history,
    setHistory,
    loading,
    handleSend,
    messagesEndRef
  } = chatService(activeChatId, setActiveChatId);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("activeChatId", activeChatId);
    }
  }, [activeChatId]);

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

  const handleEndChat = async () => {
    const closingChatId = activeChatId; 
    setLastChatId(closingChatId); 
    await authFetch('http://127.0.0.1:8000/close-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: closingChatId }),
    });
    setActiveChatId(null);
    localStorage.removeItem("activeChatId");
    setShowFeedback(true);
    setHistory([]); 
  };

  const sugestoes = [
    "Quais são os horários de funcionamento?",
    "Onde ficam as unidades?",
    "Quero ver o cardápio",
    "Quais formas de pagamento aceitam?",
    "Como faço para enviar meu currículo?",
  ];

  const FeedbackModal = () => (
    <div
      className="fixed inset-0 bg-black bg-black/70 flex items-center justify-center z-50"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div className="bg-surface rounded-3xl p-8 shadow-2xl flex flex-col items-center min-w-[320px]">
        <p className="mb-4 text-color text-lg font-semibold">Como foi seu atendimento?</p>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              className={`text-3xl cursor-pointer ${rating >= n ? "text-yellow-400" : "text-gray-400"}`}
              onClick={() => setRating(n)}
              aria-label={`Avaliação ${n} estrela${n > 1 ? "s" : ""}`}
            >★</button>
          ))}
        </div>
        <button
          className="bg-purple text-white px-6 py-2 rounded-3xl cursor-pointer font-semibold"
          onClick={async () => {
            if (!lastChatId) {
              alert("Erro interno: chatId não encontrado para avaliação.");
              return;
            }
            await authFetch('http://127.0.0.1:8000/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chatId: lastChatId, rating }),
            });
            setShowFeedback(false);
            setHistory([]); 
          }}
          disabled={rating === 0}
        >
          Enviar avaliação
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-color text-[#e5e5e5] relative">
      {history.length > 2 && (
        <button
          className="absolute top-8 right-8 z-50 bg-red text-white px-4 py-2 rounded-3xl shadow-lg hover:bg-[#555] transition cursor-pointer"
          onClick={handleEndChat}
        >
          Encerrar atendimento
        </button>
      )}

      <div className="flex flex-col flex-grow items-center px-4 py-6 overflow-y-auto">
        <div className="bg-surface h-full rounded-4xl px-6 py-4 w-full max-w-[800px] overflow-y-auto space-y-4 max-h-[645px] shadow-2xl">
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

            if (msg.role === "agent") {
              return (
                <div key={index} className="flex items-start">
                  <div className="mr-3 text-[32px] shrink-0 text-green-600">
                    <SquareUser size={30}/>
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
        className="flex bg-surface items-center gap-2 p-3 pr-3 rounded-4xl w-full max-w-[800px] self-center mb-3 shadow-2xl"
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
          placeholder="Mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
          className="flex-grow p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"
        />

        <button
          type="submit"
          title="Enviar mensagem"
          disabled={loading || !message.trim()}
          className="flex justify-center align-center px-5 py-3 bg-purple text-white font-semibold rounded-4xl hover:bg-[#555] transition disabled:bg-gray-400 cursor-pointer"
        >
          {loading ? <Ellipsis size={20}/> : <Send size={20}/>}
        </button>
      </form>
      <div className="flex gap-2 justify-center m-2 mb-6 overflow-x-auto hidden sm:flex">
        {sugestoes.map((s, i) => ( 
          <button
            key={i}
            type="button"
            className="bg-surface cursor-pointer text-color px-3 py-1 rounded-3xl border border-color hover:bg-purple hover:text-white transition shadow-"
            onClick={() => setMessage(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {showFeedback && <FeedbackModal />}
    </div>
  );
}