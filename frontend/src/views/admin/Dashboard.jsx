import ChatWindow from '../../components/ChatWindow.jsx'
import MicroBotPanel from '../../components/MicroBotPanel.jsx'

export default function Dashboard() {
  return (
    <div className='flex flex-row px-8 py-6 gap-6 h-full'>
        <ChatWindow />
        <MicroBotPanel />
    </div>
  );
}
