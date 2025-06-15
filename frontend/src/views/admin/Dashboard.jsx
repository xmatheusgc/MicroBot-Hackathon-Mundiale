import { useState } from 'react';
import AdminChatComponent from '../../components/AdminChatComponent.jsx'
import MicroBotPanel from '../../components/MicroBotPanel.jsx'

export default function Dashboard() {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className='flex flex-row px-8 py-6 gap-6 h-full'>
        <AdminChatComponent activeChatId={activeChatId} />
        <MicroBotPanel activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
    </div>
  );
}
