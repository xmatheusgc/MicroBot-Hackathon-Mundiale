import AdminChatComponent from '../../components/AdminChatComponent.jsx'
import MicroBotPanel from '../../components/MicroBotPanel.jsx'

export default function Dashboard() {
  return (
    <div className='flex flex-row px-8 py-6 gap-6 h-full'>
        <AdminChatComponent />
        <MicroBotPanel />
    </div>
  );
}
