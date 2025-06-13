import { useState } from 'react';

export default function MicroBotPanel() {

  return (
    <>
        <section className='flex flex-col grow-3 rounded-3xl p-4 bg-surface shadow-2xl'>
            <div>Username: </div>
            <div>Status :</div>
            <div> 
                <p>Suggested message:</p>
                <textarea name="suggested-message" id="suggested-message"></textarea>
            </div>
        </section>
    </>
  );
}
