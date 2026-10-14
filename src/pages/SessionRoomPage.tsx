import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatINR, formatISTTime, formatISTDate } from '../lib/utils';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  FileText,
  Paperclip,
  Share2,
  AlertTriangle,
  Clock,
  Star,
  CheckCircle,
  X,
  Send,
  Download,
  Plus,
  RefreshCw,
  Sparkles,
  Smile,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { callService, CallParticipant } from '../services/callProvider';
import { Session, ChatMessage, UploadedFile } from '../types';
import { useToast } from '../components/ui/Toast';

export const SessionRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sessions, completeSession, saveSessionNotes } = useProblemStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [session, setSession] = useState<Session | null>(null);

  // Call & Media state
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
  const [remoteParticipant, setRemoteParticipant] = useState<CallParticipant | null>(null);

  // Layout tabs & responsive state
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'notes' | 'details'>('chat');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Timer & Extension state
  const [elapsedSeconds, setElapsedSeconds] = useState(25 * 60 + 14); // start demo at ~25 min
  const [totalSeconds, setTotalSeconds] = useState(45 * 60);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(15);

  // Notes state
  const [privateNotes, setPrivateNotes] = useState(
    'Key observations:\n- windowSoftInputMode="adjustResize" needed in AndroidManifest.xml\n- Add Keyboard.addListener("keyboardWillShow") in useEffect hook.\n- Tested on Android 14 gesture navigation.'
  );
  const [notesSavedAt, setNotesSavedAt] = useState('Saved just now');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderId: 'usr_solver_001',
      senderName: 'Dr. Rajesh Raman',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      text: 'Hello Ananya! I have your AndroidManifest and capacitor.config.ts pulled up. Can you reproduce the soft keyboard overlap on screen?',
      timestamp: '02:04 PM IST',
      isMe: user?.role === 'solver',
      status: 'read',
    },
    {
      id: 'm2',
      senderId: 'usr_seeker_001',
      senderName: 'Ananya Sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: 'Hi Dr. Rajesh! Yes, let me share screen. Whenever input focuses, the bottom tab bar floats above the keyboard instead of pinning below.',
      timestamp: '02:06 PM IST',
      isMe: user?.role !== 'solver',
      status: 'read',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Shared Files state
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: 'f1', name: 'AndroidManifest.xml', size: 24000, type: 'text/xml' },
    { id: 'f2', name: 'capacitor.config.ts', size: 12000, type: 'text/typescript' },
    { id: 'f3', name: 'safe_area_fix_patch.diff', size: 8500, type: 'text/plain' },
  ]);

  // End of Session / Review Modals
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [problemSolvedChoice, setProblemSolvedChoice] = useState<'yes' | 'no'>('yes');
  const [starRating, setStarRating] = useState(5);
  const [reviewComment, setReviewComment] = useState(
    'Dr. Rajesh is exceptionally thorough and articulate. Solved the Capacitor Android inset bug in 40 minutes.'
  );
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>([
    'Clear explanation',
    'On time',
    'Expert knowledge',
  ]);

  // HTML Media Video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = sessions.find((s) => s.id === id) || sessions[0];
    setSession(found);
    if (found?.durationMinutes) {
      setTotalSeconds(found.durationMinutes * 60);
    }
  }, [sessions, id]);

  // Initialize Call Provider
  useEffect(() => {
    let mounted = true;
    async function initCall() {
      if (!session) return;
      try {
        const { localStream, remoteStream } = await callService.join(
          session.id,
          user || {
            id: 'usr_seeker_001',
            name: 'Ananya Sharma',
            email: 'seeker@demo.com',
            phone: '+91 98765 43210',
            role: 'seeker',
            createdAt: new Date().toISOString(),
          },
          { video: session.mode === 'video', audio: true }
        );

        if (!mounted) return;

        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        callService.onParticipantJoined((p) => {
          if (mounted) setRemoteParticipant(p);
        });

        callService.onConnectionStatusChange((status) => {
          if (mounted) {
            setConnectionStatus(status === 'reconnecting' ? 'reconnecting' : 'connected');
          }
        });
      } catch (e) {
        console.error('Call initialization error', e);
      }
    }

    initCall();

    return () => {
      mounted = false;
      callService.leave();
    };
  }, [session?.id]);

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isPartnerTyping]);

  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleMic = async () => {
    const next = await callService.toggleMic();
    setIsMicOn(next);
  };

  const handleToggleCamera = async () => {
    const next = await callService.toggleCamera();
    setIsCameraOn(next);
  };

  const handleSwitchCamera = async () => {
    if (callService.switchCamera) {
      await callService.switchCamera();
      success('Camera Switched', 'Switched between front and rear cameras');
    }
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      if (callService.stopScreenShare) await callService.stopScreenShare();
      setIsScreenSharing(false);
    } else {
      if (callService.shareScreen) {
        const stream = await callService.shareScreen();
        if (stream) {
          setIsScreenSharing(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      }
    }
  };

  // Chat send message with automated partner reply simulation
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'usr_me',
      senderName: user?.name || 'You',
      text: inputMessage.trim(),
      timestamp: formatISTTime(new Date()),
      isMe: true,
      status: 'delivered',
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // Simulate other party response after 3 seconds
    setIsPartnerTyping(true);
    setTimeout(() => {
      setIsPartnerTyping(false);
      const partnerReplies = [
        'Understood! I see the issue with windowSoftInputMode in the manifest.',
        'Great, I tested that patch locally. The keyboard now resizes the viewport smoothly.',
        'Looks solid! All tests passing on Android gesture mode.',
        'Shall we mark this problem solved and complete the milestone?',
      ];
      const randomReply =
        partnerReplies[Math.floor(Math.random() * partnerReplies.length)];

      const otherParticipant =
        user?.role === 'seeker'
          ? {
              id: session?.solverId || 'usr_solver_001',
              name: session?.solverName || 'Dr. Rajesh Raman',
              avatar: session?.solverAvatar,
            }
          : {
              id: session?.seekerId || 'usr_seeker_001',
              name: session?.seekerName || 'Ananya Sharma',
              avatar: session?.seekerAvatar,
            };

      const replyMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: otherParticipant.id,
        senderName: otherParticipant.name,
        senderAvatar: otherParticipant.avatar,
        text: randomReply,
        timestamp: formatISTTime(new Date()),
        isMe: false,
        status: 'read',
      };
      setChatMessages((prev) => [...prev, replyMsg]);
    }, 2800);
  };

  const handleQuickEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const handleNotesChange = (text: string) => {
    setPrivateNotes(text);
    if (session) {
      saveSessionNotes(session.id, text);
      setNotesSavedAt(`Saved at ${formatISTTime(new Date())}`);
    }
  };

  const handleExtendConfirm = () => {
    setTotalSeconds((prev) => prev + extendMinutes * 60);
    setIsExtendModalOpen(false);
    success(
      'Session Extended',
      `Added +${extendMinutes} minutes. Additional charge of ${formatINR(
        extendMinutes === 15 ? 250 : 500
      )} noted.`
    );
  };

  const handleFinishSession = async () => {
    if (!session) return;
    await completeSession(
      session.id,
      problemSolvedChoice === 'yes',
      starRating,
      reviewComment,
      selectedReviewTags
    );
    setIsEndSessionModalOpen(false);
    setIsSummaryModalOpen(true);
    success('Session Completed', 'Escrow release confirmed and rating recorded.');
  };

  const downloadTranscript = () => {
    const text = chatMessages
      .map((m) => `[${m.timestamp}] ${m.senderName}: ${m.text}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SolveBridge-Transcript-${session?.id || 'session'}.txt`;
    a.click();
    success('Transcript Downloaded', 'Full chat log saved to your device.');
  };

  if (!session) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading live session room...</p>
      </div>
    );
  }

  const isChatOnly = session.mode === 'chat';
  const isAudioOnly = session.mode === 'audio';
  const otherName = user?.role === 'seeker' ? session.solverName : session.seekerName;
  const otherAvatar = user?.role === 'seeker' ? session.solverAvatar : session.seekerAvatar;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-white select-none overflow-hidden relative">
      {/* 1. Top Call Header Bar */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3 truncate">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Room
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <h2 className="text-sm font-bold text-slate-200 truncate hidden sm:inline">
            {session.problemTitle}
          </h2>
        </div>

        {/* Center: Timer & 5-min warning badge */}
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all',
              remainingSeconds <= 300
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(elapsedSeconds)}</span>
            <span className="text-slate-500 font-sans text-[10px]">
              ({formatTimer(remainingSeconds)} left)
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExtendModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs text-indigo-300 hover:text-white hover:bg-slate-800 py-1 px-2.5 min-h-[32px]"
          >
            Extend
          </Button>
        </div>

        {/* Right: Panel toggle & connection badge */}
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 px-2.5 py-1 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
              )}
            />
            <span className="capitalize">{connectionStatus}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isPanelOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {isPanelOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 5-Minute Warning Banner if applicable */}
      {remainingSeconds <= 300 && remainingSeconds > 0 && (
        <div className="bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 z-20">
          <AlertTriangle className="w-4 h-4 text-slate-950" />
          <span>Warning: 5 minutes remaining in this booked session window.</span>
          <button
            type="button"
            onClick={() => setIsExtendModalOpen(true)}
            className="underline font-black hover:opacity-80 ml-2"
          >
            Extend Now
          </button>
        </div>
      )}

      {/* 2. Main Body Grid: Desktop Video Area (Left) + Side Panel (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Calling / Media Canvas */}
        <div
          className={cn(
            'flex-1 flex flex-col justify-between p-3 sm:p-4 bg-slate-950 relative overflow-hidden transition-all duration-300',
            isChatOnly && 'hidden lg:flex'
          )}
        >
          {/* Main Media Container */}
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
            {/* VIDEO MODE */}
            {!isAudioOnly && !isChatOnly && (
              <>
                {/* Remote Participant Video Feed */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Floating Remote Name Tag */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{otherName}</span>
                </div>

                {/* Local User Self-View PiP (Picture in Picture) */}
                <div className="absolute bottom-4 right-4 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl z-10">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn('w-full h-full object-cover', !isCameraOn && 'hidden')}
                  />
                  {!isCameraOn && (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                      Camera Off
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    You {!isMicOn && '• Mic Off'}
                  </div>
                </div>
              </>
            )}

            {/* AUDIO-ONLY MODE */}
            {isAudioOnly && (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  {/* Pulsing sound wave rings */}
                  <div className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping" />
                  <div className="absolute -inset-8 rounded-full bg-indigo-500/10 animate-pulse" />
                  <img
                    src={otherAvatar}
                    alt={otherName}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500 relative shadow-2xl"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-extrabold text-white">{otherName}</h3>
                  <p className="text-xs text-indigo-400 font-medium mt-1 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    HD Audio Connected • Voice Activity Detected
                  </p>
                </div>
              </div>
            )}

            {/* CHAT-ONLY MODE (DESKTOP PREVIEW) */}
            {isChatOnly && (
              <div className="text-center space-y-3 p-6 text-slate-400">
                <MessageSquare className="w-12 h-12 text-indigo-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Full-Width Chat Mode Active</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This problem was booked as a text-only consultation. You can collaborate via real-time messages, file sharing, and code notes.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Floating Controls Bar */}
          <div className="py-3 px-4 flex items-center justify-center gap-3 z-20">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={cn(
                'p-3.5 rounded-2xl transition-all shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center',
                isMicOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/20'
              )}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Camera Toggle (Hide on audio/chat) */}
            {!isAudioOnly && !isChatOnly && (
              <button
                type="button"
                onClick={handleToggleCamera}
                className={cn(
                  'p-3.5 rounded-2xl transition-all shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center',
                  isCameraOn
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/20'
                )}
                title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            )}

            {/* Switch Camera (Mobile only) */}
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="lg:hidden p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Switch Camera (Front/Rear)"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Screen Share (Desktop only) */}
            <button
              type="button"
              onClick={handleScreenShare}
              className={cn(
                'hidden lg:flex p-3.5 rounded-2xl transition-all shadow-lg min-h-[48px] min-w-[48px] items-center justify-center',
                isScreenSharing
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              )}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* Mobile Chat Bottom Sheet Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileChatOpen(true)}
              className="lg:hidden p-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center relative"
              title="Open Chat"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            {/* Raise Issue / Support */}
            <button
              type="button"
              onClick={() => success('Support Request', 'SolveBridge moderator alerted.')}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center"
              title="Report issue or request support"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={() => setIsEndSessionModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-900/40 flex items-center gap-2 min-h-[48px]"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Right Collapsible Panel: Tabs [Chat | Files | Notes | Details] */}
        <div
          className={cn(
            'bg-white text-slate-900 flex flex-col border-l border-slate-200 transition-all duration-300 z-10',
            isChatOnly ? 'flex-1' : isPanelOpen ? 'w-full lg:w-[380px] xl:w-[420px]' : 'hidden'
          )}
        >
          {/* Panel Header Tabs */}
          <div className="h-14 border-b border-slate-200 px-3 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-1">
              {[
                { id: 'chat', label: 'Chat', icon: MessageSquare },
                { id: 'files', label: 'Files', icon: Paperclip },
                { id: 'notes', label: 'Notes', icon: FileText },
                { id: 'details', label: 'Details', icon: ShieldCheck },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as any)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px]',
                      activeTab === t.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsPanelOpen(false)}
              className="hidden lg:flex p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TAB CONTENT 1: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden text-left">
              {/* Message History */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs text-slate-800"
              >
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end gap-2',
                      msg.isMe ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!msg.isMe && (
                      <img
                        src={
                          msg.senderAvatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderName}`
                        }
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                      />
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] p-3 rounded-2xl shadow-xs leading-relaxed',
                        msg.isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={cn(
                          'flex items-center justify-end gap-1 mt-1 text-[10px]',
                          msg.isMe ? 'text-indigo-200' : 'text-slate-400'
                        )}
                      >
                        <span>{msg.timestamp}</span>
                        {msg.isMe && (
                          <span title="Delivered & read">
                            <Check className="w-3 h-3 text-indigo-300" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isPartnerTyping && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                    <span>{otherName} is typing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input & Emoji Strip */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-1.5">
                  {['👍', '💡', '🔥', '🙌', '🚀'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleQuickEmoji(em)}
                      className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs hover:bg-slate-100"
                    >
                      {em}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={downloadTranscript}
                    className="ml-auto text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Log
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message or code hint..."
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="h-10 px-3.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: FILES */}
          {activeTab === 'files' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shared Session Files ({files.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => success('Upload File', 'File attached to live room.')}
                  leftIcon={<Plus className="w-3 h-3" />}
                  className="text-xs py-1"
                >
                  Upload
                </Button>
              </div>

              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => success('Download', `Downloading ${file.name}`)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200/60"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: PRIVATE NOTES (AUTOSAVE) */}
          {activeTab === 'notes' && (
            <div className="flex-1 p-4 flex flex-col justify-between text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Private Session Notes
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {notesSavedAt}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Only you can view these notes. They are saved automatically to your account.
              </p>
              <textarea
                rows={14}
                value={privateNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Write observations, terminal commands, or follow-up action items here..."
                className="flex-1 w-full p-3.5 rounded-2xl border border-slate-300 text-xs font-mono text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
          )}

          {/* TAB CONTENT 4: DETAILS */}
          {activeTab === 'details' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-left text-xs">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {session.problemCategory}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{session.problemTitle}</h4>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date (IST):</span>
                  <span className="font-bold text-slate-900">{formatISTDate(session.slot.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Slot:</span>
                  <span className="font-bold text-slate-900">
                    {session.slot.startTime} - {session.slot.endTime} IST
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreed Fee:</span>
                  <span className="font-bold text-emerald-700">{formatINR(session.fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Escrow Status:</span>
                  <span className="font-bold text-indigo-700">Locked in Milestone Escrow</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1">
                <span className="font-bold text-indigo-900 block">Milestone Escrow Policy:</span>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Funds are released to the solver within 24 hours after both parties conclude the session.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE CHAT BOTTOM SHEET */}
      {isMobileChatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsMobileChatOpen(false)}
          />
          <div className="relative bg-white text-slate-900 rounded-t-3xl h-[70vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-250">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Live Session Chat</h3>
              <button
                type="button"
                onClick={() => setIsMobileChatOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex items-end gap-2', msg.isMe ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] p-3 rounded-2xl shadow-xs',
                      msg.isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'
                    )}
                  >
                    <p>{msg.text}</p>
                    <span className="block text-[9px] text-right mt-1 opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10 px-3 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
              <Button type="submit" variant="primary" size="sm">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* EXTEND SESSION MODAL */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Session"
        description="Need more time to resolve the problem? Add extra duration in IST."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsExtendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExtendConfirm}>
              Confirm Extension
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left text-xs">
          <label className="block text-slate-600 font-bold uppercase tracking-wider">
            Select Extension Window:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { mins: 15, fee: 250 },
              { mins: 30, fee: 500 },
            ].map((ext) => (
              <button
                key={ext.mins}
                type="button"
                onClick={() => setExtendMinutes(ext.mins)}
                className={cn(
                  'p-3.5 rounded-2xl border text-center transition-all',
                  extendMinutes === ext.mins
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold ring-2 ring-indigo-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                <span className="block text-base font-black">+{ext.mins} mins</span>
                <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
                  {formatINR(ext.fee)} additional
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            The additional fee will be confirmed with both parties and debited upon session conclusion.
          </p>
        </div>
      </Modal>

      {/* END SESSION / REVIEW MODAL */}
      <Modal
        isOpen={isEndSessionModalOpen}
        onClose={() => setIsEndSessionModalOpen(false)}
        title="Conclude Session & Escrow Settlement"
        description="Complete this problem-solving session and rate the collaboration."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsEndSessionModalOpen(false)}>
              Keep Session Live
            </Button>
            <Button variant="primary" size="sm" onClick={handleFinishSession}>
              Confirm & Settle Escrow
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left text-xs">
          {/* Solver Question / Confirmation */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="font-bold text-slate-900 block text-sm">
              Was the problem successfully resolved?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setProblemSolvedChoice('yes')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all',
                  problemSolvedChoice === 'yes'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200'
                )}
              >
                ✓ Yes, Problem Solved
              </button>
              <button
                type="button"
                onClick={() => setProblemSolvedChoice('no')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all',
                  problemSolvedChoice === 'no'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-200'
                )}
              >
                Needs Follow-Up
              </button>
            </div>
          </div>

          {/* Seeker 1-5 Star Rating */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
              Rate your collaboration with {otherName} (1-5 Stars):
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      'w-6 h-6',
                      star <= starRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    )}
                  />
                </button>
              ))}
              <span className="font-bold text-sm text-slate-700 ml-2">{starRating} / 5</span>
            </div>
          </div>

          {/* Quick Review Tags */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Highlights / Tags:</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Clear explanation',
                'On time',
                'Patient',
                'Expert knowledge',
                'Fast resolution',
                'Great communication',
              ].map((tag) => {
                const isSelected = selectedReviewTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedReviewTags(selectedReviewTags.filter((t) => t !== tag));
                      } else {
                        setSelectedReviewTags([...selectedReviewTags, tag]);
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review text */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Feedback & Review Comments:
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>

          {/* Escrow Release Notice */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Escrow Release Status</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {formatINR(session.fee)} will be credited to {session.solverName} within 24 hours. Thank you for using SolveBridge!
            </p>
          </div>
        </div>
      </Modal>

      {/* SUMMARY MODAL AFTER COMPLETION */}
      <Modal
        isOpen={isSummaryModalOpen}
        onClose={() => navigate('/app/sessions')}
        title="Session Summary Report"
        description="The live problem solving session has concluded."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTranscript}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download Chat Log (.txt)
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSummaryModalOpen(false);
                  navigate('/app/seeker/post');
                }}
              >
                Book Follow-Up
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/sessions')}
              >
                Go to Sessions
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-left text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Total Duration:</span>
              <span className="text-sm font-extrabold text-slate-900">
                {Math.floor(elapsedSeconds / 60)} minutes
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Status:</span>
              <span className="text-sm font-extrabold text-emerald-600">Problem Solved ✓</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 mb-1">Your Private Notes Saved:</h5>
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
              {privateNotes}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 mb-1">Shared Files ({files.length}):</h5>
            <div className="flex flex-wrap gap-1.5">
              {files.map((f) => (
                <span
                  key={f.id}
                  className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium text-[11px]"
                >
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
