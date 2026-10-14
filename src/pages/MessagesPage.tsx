import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Send, CheckCheck, Video, Calendar } from 'lucide-react';
import { cn, formatISTTime } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  lastMessage: string;
  time: string;
  unread?: number;
}

export const MessagesPage: React.FC = () => {
  const { user, role } = useAuthStore();
  const navigate = useNavigate();

  const contacts: ChatUser[] =
    role === 'seeker'
      ? [
          {
            id: 'c1',
            name: 'Dr. Rajesh Raman',
            role: 'IIT Madras Distributed Systems Specialist',
            avatarUrl:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            lastMessage: 'I isolated the Android safe area issue. Let us meet in our scheduled session!',
            time: '12m ago',
            unread: 1,
          },
          {
            id: 'c2',
            name: 'Priya Patel',
            role: 'Lead UI/UX & Design Systems',
            avatarUrl:
              'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
            lastMessage: 'Figma tokens exported to JSON. Ready for review.',
            time: '2h ago',
          },
        ]
      : [
          {
            id: 'c3',
            name: 'Ananya Sharma',
            role: 'Startup Founder • Seeker',
            avatarUrl:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            lastMessage: 'Thanks Rajesh! Let me verify the Android build on a physical test device.',
            time: '15m ago',
            unread: 1,
          },
        ];

  const [activeContact, setActiveContact] = useState<ChatUser>(contacts[0]);
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: activeContact.name,
      text: 'Namaste! I reviewed your problem description and preferred IST windows.',
      time: '10:30 AM IST',
      isMe: false,
    },
    {
      id: 'm2',
      sender: user?.name || 'You',
      text: 'Great! We need to make sure the soft keyboard resize doesn’t push the bottom tab bar up.',
      time: '10:32 AM IST',
      isMe: true,
    },
    {
      id: 'm3',
      sender: activeContact.name,
      text: 'Understood. Setting windowSoftInputMode="adjustResize" with edge-to-edge insets in AndroidManifest.xml will fix this during our live session.',
      time: '10:35 AM IST',
      isMe: false,
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: user?.name || 'You',
      text: inputText,
      time: formatISTTime(new Date()),
      isMe: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate instant reply from solver/seeker
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `m_rep_${Date.now()}`,
          sender: activeContact.name,
          text: 'Got your update. Ready for our live session!',
          time: formatISTTime(new Date()),
          isMe: false,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="h-[calc(100dvh-140px)] min-h-[500px] flex rounded-3xl bg-white border border-slate-200/90 shadow-card overflow-hidden text-left animate-in fade-in max-w-6xl mx-auto">
      {/* Left Chat List */}
      <div className="w-full sm:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-heading">
            Direct Messages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Pre-booking & task communication</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {contacts.map((c) => {
            const isSelected = activeContact.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setActiveContact(c)}
                className={cn(
                  'p-3.5 flex items-center space-x-3 cursor-pointer transition-colors',
                  isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/60'
                )}
              >
                <img
                  src={c.avatarUrl}
                  alt={c.name}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                    <span className="text-[10px] text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Conversation Window */}
      <div className="hidden sm:flex flex-col flex-1 bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={activeContact.avatarUrl}
              alt={activeContact.name}
              className="w-10 h-10 rounded-2xl object-cover"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeContact.name}</h3>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online • {activeContact.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/sessions')}
              leftIcon={<Video className="w-3.5 h-3.5 text-indigo-600" />}
              className="text-xs"
            >
              Go to Sessions
            </Button>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Escrow Active
            </span>
          </div>
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex flex-col', m.isMe ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-md p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs',
                  m.isMe
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                )}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                {m.time} {m.isMe && <CheckCheck className="w-3 h-3 text-indigo-500" />}
              </span>
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${activeContact.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 h-11 px-4 bg-slate-100 border-none rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="px-4"
            disabled={!inputText.trim()}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
