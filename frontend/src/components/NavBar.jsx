import { useState } from 'react';

export default function NavBar({theme, toggleTheme}) {

  return (
    <nav className='flex justify-between'>
      <div>
        <h1 className='font-bold text-4xl'>MicroBot</h1>
        <p className='text-xs'>by <a href="" className='text-purple'>LLMakers</a></p>
      </div>
      <div className='flex'>
        <label className="inline-flex items-center mb-5 cursor-pointer">
          <input type="checkbox" value="" className="sr-only peer" defaultChecked={theme === 'dark'} onChange={(e) => toggleTheme()}/>
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
        </label>

        <span className='bg-surface rounded-lg border'>User</span>
      </div>
    </nav>
  );
}
