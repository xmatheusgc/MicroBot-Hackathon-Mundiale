import { useState } from 'react';

export default function ChatWindow() {

  return (
    <>
        <section className='flex flex-col justify-between grow-1 rounded-3xl bg-surface shadow-2xl p-4'>
            <div className='chat-header'>
                Username
            </div>
            <div className='messages-container flex flex-col p-4 h-full'>
                <span className='border rounded-xl px-12 py-1'>Message 1</span>
            </div>
            <div className='flex chat-tools gap-2 justify-center p-2'>
                <input className='rounded-xl px-4 py-2 grow-3 input-color' type="text" placeholder='Message'/>
                <button className='rounded-xl px-4 py-1 grow-1 bg-purple text-color-white'>Send</button>
            </div>
        </section>
    </>
  );
}
