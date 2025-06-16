import { useState } from 'react';
import AdminChatWindow from '../../components/AdminChatWindow.jsx'
import ChatListPanel from '../../components/ChatListPanel.jsx'

export default function Dashboard() {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <div className='flex flex-row px-8 py-6 gap-6 h-full'>
        <AdminChatWindow activeChatId={activeChatId} />
        <ChatListPanel activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
    </div>
  );
}
