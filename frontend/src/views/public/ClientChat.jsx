import { useState, useRef } from "react";
import { Paperclip, Mic, Bot } from "lucide-react";

export default function ClientChat() {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviada:", message);
    setMessage("");
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Arquivo selecionado:", file.name);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-color text-[#e5e5e5]">
      <div className="flex flex-col flex-grow items-center justify-between px-4 py-6">
        <div className="flex items-start w-full max-w-[800px] mb-6">
          <div className="mr-3 text-[32px] shrink-0 text-purple">
            <Bot size={32} />
          </div>
          <div className="bg-surface px-8 py-6 rounded-3xl max-w-[800px] shadow-2xl">
            <p className="mb-2 leading-relaxed text-color">
              Olá! Sou MicroBot Copilot, seu assistente virtual.
            </p>
            <p className="leading-relaxed text-color">
              Fique à vontade para falar sobre qualquer assunto.
            </p>
          </div>
        </div>

        <form
          className="flex bg-surface items-center gap-2 p-3 pr-3 mt-auto rounded-4xl w-full max-w-[800px] shadow-2xl"
          onSubmit={handleSubmit}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden input-color"
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
            className="flex-grow p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"
          />

          <button
            type="submit"
            title="Enviar mensagem"
            className="ml-2 px-5 py-3 bg-purple text-color-white cursor-pointer rounded-4xl hover:bg-[#555] transition"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}