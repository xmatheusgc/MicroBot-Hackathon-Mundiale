import { useState, useRef } from "react";
import { Paperclip, Mic, Bot } from "lucide-react";
import "../css/App.css";
import "../css/ClientChat.css";

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
    <div className="chat-container">
      <div className="chat-message bot">
        <div className="chat-avatar">
          <Bot size={32} />
        </div>
        <div className="chat-content">
          <p>
            Meu nome é LLMaker! Sou um assistente virtual para solucionar
            problemas.
          </p>
          <p>Qual sua dúvida? Estou aqui para ajudar!</p>
          <p>Fique à vontade para falar sobre qualquer assunto.</p>
        </div>
      </div>

      <form className="chat-input-container" onSubmit={handleSubmit}>
        {/* Input oculto por cima do ícone de anexar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div className="icon-actions">
          <div
            className="icon-button attach-icon"
            title="Anexar arquivo"
            onClick={handleFileClick}
            style={{ cursor: "pointer" }}
          >
            <Paperclip size={18} />
          </div>

          <div className="icon-button mic-icon" title="Ditar">
            <Mic size={18} />
          </div>
        </div>

        <input
          type="text"
          placeholder="Mensagem para o Copilot"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button type="submit" title="Enviar mensagem">
          Enviar
        </button>
      </form>
    </div>
  );
}
