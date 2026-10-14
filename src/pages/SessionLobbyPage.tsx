import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProblemStore } from '../store/problemStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { formatINR, formatISTDate } from '../lib/utils';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { callService } from '../services/callProvider';
import { Session } from '../types';

export const SessionLobbyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sessions } = useProblemStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const found = sessions.find((s) => s.id === id) || sessions[0];
    setSession(found);
  }, [sessions, id]);

  // Request media stream for lobby preview
  const startPreview = async () => {
    setPermissionError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Enumerate devices
        const vDevices = await callService.getVideoInputDevices();
        const aDevices = await callService.getAudioInputDevices();
        setVideoDevices(vDevices);
        setAudioDevices(aDevices);
        if (vDevices.length > 0) setSelectedVideoDevice(vDevices[0].deviceId);
        if (aDevices.length > 0) setSelectedAudioDevice(aDevices[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Lobby camera/mic permission error:', err);
      setPermissionError(
        'Camera or microphone access was blocked. On Android Chrome or WebView, tap the padlock / permission settings in your address bar and set Camera & Mic to Allow, then click Retry.'
      );
    }
  };

  useEffect(() => {
    startPreview();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  const handleDeviceChange = async (type: 'video' | 'audio', deviceId: string) => {
    if (type === 'video') {
      setSelectedVideoDevice(deviceId);
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: isMicOn,
          });
          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = newStream;
          }
          localStreamRef.current = newStream;
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setSelectedAudioDevice(deviceId);
    }
  };

  const handleJoin = () => {
    if (session) {
      // Clean up lobby preview stream before entering live room
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      navigate(`/app/sessions/${session.id}/room`);
    }
  };

  if (!session) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading session lobby...</p>
      </div>
    );
  }

  const otherParticipantName =
    user?.role === 'seeker' ? session.solverName : session.seekerName;
  const otherParticipantAvatar =
    user?.role === 'seeker' ? session.solverAvatar : session.seekerAvatar;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-left animate-in fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
          Pre-Join Lobby
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-2">
          Ready to join your session?
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Check your camera & microphone, verify device inputs, and enter the live collaboration room.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Video Preview Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
            {/* Real or Mock Video */}
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className={cn(
                'w-full h-full object-cover',
                !isCameraOn && 'hidden'
              )}
            />

            {/* Camera off placeholder */}
            {!isCameraOn && (
              <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xl font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
                <p className="text-xs font-semibold">Camera is turned off</p>
              </div>
            )}

            {/* Permission Error Warning Banner */}
            {permissionError && (
              <div className="absolute inset-x-4 top-4 p-3 bg-rose-900/90 text-white rounded-2xl backdrop-blur-md border border-rose-700/80 text-xs flex items-start gap-2.5 z-10">
                <AlertTriangle className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{permissionError}</p>
                  <button
                    type="button"
                    onClick={startPreview}
                    className="mt-1.5 underline text-rose-200 hover:text-white flex items-center gap-1 font-bold"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Permission Check
                  </button>
                </div>
              </div>
            )}

            {/* Bottom floating preview controls */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-10">
              <button
                type="button"
                onClick={toggleMic}
                className={cn(
                  'p-3 rounded-2xl backdrop-blur-md shadow-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center',
                  isMicOn
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/30'
                )}
                title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={cn(
                  'p-3 rounded-2xl backdrop-blur-md shadow-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center',
                  isCameraOn
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/30'
                )}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Device Selectors */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5 text-indigo-600" /> Device Preferences
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Camera Device</label>
                <select
                  value={selectedVideoDevice}
                  onChange={(e) => handleDeviceChange('video', e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  {videoDevices.length > 0 ? (
                    videoDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${d.deviceId.slice(0, 4)}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default Front Camera</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Microphone</label>
                <select
                  value={selectedAudioDevice}
                  onChange={(e) => handleDeviceChange('audio', e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  {audioDevices.length > 0 ? (
                    audioDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Microphone ${d.deviceId.slice(0, 4)}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default System Microphone</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Session Details & Join Action */}
        <div className="lg:col-span-5 space-y-5">
          {/* Session Details Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-card space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                {session.problemCategory}
              </span>
              <h3 className="text-base font-bold text-slate-900 line-clamp-2 mt-0.5">
                {session.problemTitle}
              </h3>
            </div>

            {/* Other Participant */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-3">
              <img
                src={otherParticipantAvatar}
                alt={otherParticipantName}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="min-w-0">
                <span className="text-xs text-slate-400 block font-medium">Meeting with:</span>
                <p className="text-sm font-bold text-slate-900 truncate">{otherParticipantName}</p>
              </div>
            </div>

            {/* Scheduled Time & Mode */}
            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Date (IST):</span>
                <span className="font-bold text-slate-900">{formatISTDate(session.slot.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Slot:</span>
                <span className="font-bold text-slate-900">
                  {session.slot.startTime} - {session.slot.endTime} IST
                </span>
              </div>
              <div className="flex justify-between">
                <span>Session Fee:</span>
                <span className="font-bold text-slate-900">{formatINR(session.fee)} (Escrow)</span>
              </div>
              <div className="flex justify-between">
                <span>Planned Mode:</span>
                <span className="font-bold text-slate-900 capitalize">{session.mode} Call</span>
              </div>
            </div>

            {/* Network Indicator */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-emerald-900 block">Connection: Excellent</span>
                  <span className="text-[10px] text-emerald-700">Latency: 24ms • 48 Mbps</span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Primary Join Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleJoin}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full justify-center shadow-elevated"
            >
              Join Session Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
