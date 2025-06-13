import { useState } from 'react';

export default function ChatWindow() {

  return (
    <>
        <section className='flex flex-col justify-between grow-1 border rounded-lg'>
            <div className='chat-header border'>
                Username
            </div>
            <div className='messages-container flex flex-col p-2 h-full'>
                <span className='border rounded-xl px-12 py-1'>Message 1</span>
                <span className='border rounded-xl px-12 py-1'>Message 2</span>
            </div>
            <div className='flex chat-tools gap-2 border'>
                <input className='border rounded-xl px-4 py-1' type="text" placeholder='Message'/>
                <button className='border rounded-xl px-4 py-1'>Send</button>
            </div>
        </section>
    </>
  );
}
