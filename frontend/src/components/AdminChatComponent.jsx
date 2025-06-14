import React from 'react';
import { Paperclip, Mic, Bot } from "lucide-react";
import { chatService } from '../services/chatService';

export default function AdminChatComponent() {
  const {
    message,
    setMessage,
    history,
    loading,
    handleSend,
    messagesEndRef
  } = chatService();

  const firstBotIndex = history.findIndex(msg => msg.role === 'model');

  return (
    <section className='flex flex-col justify-between grow-1 rounded-3xl bg-surface shadow-2xl px-4 py-2 h-full max-w-1/3'>
      <div className='chat-header font-bold text-lg mb-2'>
        MicroBot
      </div>

      <div className='messages-container flex flex-col p-4 h-full overflow-y-auto border border-color rounded-2xl'>
        {history.map((msg, index) => {
          if (msg.role === 'model') {
            return (
              <div key={index} className="flex items-start w-full max-w-[800px] mb-6">
                <div className="mr-3 text-[32px] shrink-0 text-purple">
                  <Bot size={32} />
                </div>
                <div className="bg-surface p-4 rounded-3xl max-w-1/2 shadow-lg border border-color">
                  {msg.parts[0].text.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 leading-relaxed text-color">{line}</p>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="my-2 p-3 rounded-xl max-w-1/2 break-words shadow-lg bg-purple text-white self-end"
            >
              {msg.parts[0].text}
            </div>
          );
        })}
      </div>

      <div className='flex items-center gap-2 justify-center p-2 mt-2'>
        <input type="file" className="hidden input-color" />

        <div className="flex gap-2 ml-2 items-center">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-full text-purple transition cursor-pointer shadow-[0_-1px_7px_rgba(0,0,0,0.1)] hover:bg-[#737FEB] hover:!text-white"
            title="Anexar arquivo"
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
          className="flex-grow p-3 rounded-4xl input-color text-color placeholder-[#888] border-none outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
        />

        <button
          type="submit"
          title="Enviar mensagem"
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="ml-2 px-5 py-3 bg-purple text-white font-semibold rounded-4xl hover:bg-[#555] transition disabled:bg-gray-400"
        >
          {loading ? '...' : 'Enviar'}
        </button>
      </div>
    </section>
  );
}