import { User } from '../types';

/**
 * CallProvider Interface
 * ============================================================================
 * Abstract interface for audio/video calling sessions.
 *
 * TODO: To integrate a production WebRTC service:
 * 1. LiveKit: Install `livekit-client`, initialize `new Room()`, connect to WebSocket token URL.
 * 2. Agora: Install `agora-rtc-sdk-ng`, create `AgoraRTC.createClient()`, join with AppID & channel token.
 * 3. Daily: Install `@daily-co/daily-js`, call `DailyIframe.createCallObject()`.
 * 4. Jitsi: Use `JitsiMeetExternalAPI` or `lib-jitsi-meet`.
 *
 * Current implementation: MockCallProvider utilizes native browser `navigator.mediaDevices.getUserMedia`
 * when granted, falls back gracefully if camera/mic is blocked, and simulates remote participant media
 * using HTML5 Canvas streams for a fully interactive test experience on desktop and Android Capacitor.
 * ============================================================================
 */

export interface CallParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'seeker' | 'solver';
  audioEnabled: boolean;
  videoEnabled: boolean;
  isSpeaking: boolean;
}

export interface CallProvider {
  join(
    sessionId: string,
    user: User,
    options: { video: boolean; audio: boolean; preferredCameraId?: string; preferredMicId?: string }
  ): Promise<{ localStream: MediaStream | null; remoteStream: MediaStream | null }>;
  leave(): Promise<void>;
  toggleMic(enabled?: boolean): Promise<boolean>;
  toggleCamera(enabled?: boolean): Promise<boolean>;
  switchCamera?(): Promise<void>;
  shareScreen?(): Promise<MediaStream | null>;
  stopScreenShare?(): Promise<void>;
  getAudioInputDevices(): Promise<MediaDeviceInfo[]>;
  getVideoInputDevices(): Promise<MediaDeviceInfo[]>;
  getAudioOutputDevices(): Promise<MediaDeviceInfo[]>;
  setAudioInputDevice(deviceId: string): Promise<void>;
  setVideoInputDevice(deviceId: string): Promise<void>;
  onParticipantJoined(callback: (p: CallParticipant) => void): void;
  onParticipantLeft(callback: (id: string) => void): void;
  onParticipantUpdated(callback: (p: CallParticipant) => void): void;
  onConnectionStatusChange(callback: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected') => void): void;
  isMicActive(): boolean;
  isCameraActive(): boolean;
  isScreenSharingActive(): boolean;
}

export class MockCallProvider implements CallProvider {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private micActive = true;
  private cameraActive = true;
  private screenSharing = false;
  private facingMode: 'user' | 'environment' = 'user';

  private participantJoinedCallbacks: ((p: CallParticipant) => void)[] = [];
  private participantLeftCallbacks: ((id: string) => void)[] = [];
  private participantUpdatedCallbacks: ((p: CallParticipant) => void)[] = [];
  private connectionCallbacks: ((status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected') => void)[] = [];

  private currentParticipant: CallParticipant | null = null;

  async join(
    sessionId: string,
    user: User,
    options: { video: boolean; audio: boolean; preferredCameraId?: string; preferredMicId?: string }
  ) {
    this.connectionCallbacks.forEach((cb) => cb('connecting'));
    this.micActive = options.audio;
    this.cameraActive = options.video;

    // Attempt to acquire actual user media stream if browser supports it
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const constraints: MediaStreamConstraints = {
          audio: options.audio
            ? options.preferredMicId
              ? { deviceId: { exact: options.preferredMicId } }
              : true
            : false,
          video: options.video
            ? options.preferredCameraId
              ? { deviceId: { exact: options.preferredCameraId } }
              : { facingMode: this.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
        };

        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn('Real camera/mic acquisition denied or unavailable, falling back to mock stream:', err);
        this.localStream = this.createSyntheticStream(user.name, '#4f46e5');
      }
    } else {
      this.localStream = this.createSyntheticStream(user.name, '#4f46e5');
    }

    // Generate mock remote participant stream (with nice dynamic visual feedback)
    const remoteName = user.role === 'seeker' ? 'Dr. Rajesh Raman' : 'Ananya Sharma';
    this.remoteStream = this.createSyntheticStream(remoteName, '#059669');

    this.currentParticipant = {
      id: user.role === 'seeker' ? 'usr_solver_001' : 'usr_seeker_001',
      name: remoteName,
      role: user.role === 'seeker' ? 'solver' : 'seeker',
      audioEnabled: true,
      videoEnabled: options.video,
      isSpeaking: false,
    };

    setTimeout(() => {
      this.connectionCallbacks.forEach((cb) => cb('connected'));
      if (this.currentParticipant) {
        this.participantJoinedCallbacks.forEach((cb) => cb(this.currentParticipant!));
      }
    }, 600);

    return { localStream: this.localStream, remoteStream: this.remoteStream };
  }

  async leave() {
    this.stopAllTracks(this.localStream);
    this.stopAllTracks(this.remoteStream);
    this.stopAllTracks(this.screenStream);
    this.localStream = null;
    this.remoteStream = null;
    this.screenStream = null;
    this.connectionCallbacks.forEach((cb) => cb('disconnected'));
  }

  async toggleMic(enabled?: boolean): Promise<boolean> {
    this.micActive = enabled !== undefined ? enabled : !this.micActive;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = this.micActive;
      });
    }
    return this.micActive;
  }

  async toggleCamera(enabled?: boolean): Promise<boolean> {
    this.cameraActive = enabled !== undefined ? enabled : !this.cameraActive;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => {
        t.enabled = this.cameraActive;
      });
    }
    return this.cameraActive;
  }

  async switchCamera(): Promise<void> {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    if (this.localStream && navigator.mediaDevices?.getUserMedia) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: this.facingMode },
          audio: this.micActive,
        });
        this.stopAllTracks(this.localStream);
        this.localStream = newStream;
      } catch (e) {
        console.warn('Switch camera not supported on this device', e);
      }
    }
  }

  async shareScreen(): Promise<MediaStream | null> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        this.screenSharing = true;
        this.screenStream.getVideoTracks()[0].onended = () => {
          this.screenSharing = false;
        };
        return this.screenStream;
      } catch (e) {
        console.warn('Screen share cancelled or unsupported', e);
      }
    }
    return null;
  }

  async stopScreenShare(): Promise<void> {
    this.stopAllTracks(this.screenStream);
    this.screenStream = null;
    this.screenSharing = false;
  }

  async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    return this.getDevicesByType('audioinput');
  }

  async getVideoInputDevices(): Promise<MediaDeviceInfo[]> {
    return this.getDevicesByType('videoinput');
  }

  async getAudioOutputDevices(): Promise<MediaDeviceInfo[]> {
    return this.getDevicesByType('audiooutput');
  }

  async setAudioInputDevice(deviceId: string): Promise<void> {
    if (this.localStream && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: this.cameraActive,
        });
        this.stopAllTracks(this.localStream);
        this.localStream = stream;
      } catch (e) {
        console.error('Failed to switch audio input device', e);
      }
    }
  }

  async setVideoInputDevice(deviceId: string): Promise<void> {
    if (this.localStream && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: this.micActive,
        });
        this.stopAllTracks(this.localStream);
        this.localStream = stream;
      } catch (e) {
        console.error('Failed to switch video input device', e);
      }
    }
  }

  onParticipantJoined(callback: (p: CallParticipant) => void) {
    this.participantJoinedCallbacks.push(callback);
  }

  onParticipantLeft(callback: (id: string) => void) {
    this.participantLeftCallbacks.push(callback);
  }

  onParticipantUpdated(callback: (p: CallParticipant) => void) {
    this.participantUpdatedCallbacks.push(callback);
  }

  onConnectionStatusChange(callback: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected') => void) {
    this.connectionCallbacks.push(callback);
  }

  isMicActive() {
    return this.micActive;
  }

  isCameraActive() {
    return this.cameraActive;
  }

  isScreenSharingActive() {
    return this.screenSharing;
  }

  private async getDevicesByType(kind: MediaDeviceKind): Promise<MediaDeviceInfo[]> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        return list.filter((d) => d.kind === kind);
      } catch {
        return [];
      }
    }
    return [];
  }

  private stopAllTracks(stream: MediaStream | null) {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  }

  /**
   * Generates a canvas-based synthetic MediaStream with participant's name & avatar indicator
   */
  private createSyntheticStream(name: string, bgHex: string): MediaStream {
    if (typeof document === 'undefined') return new MediaStream();
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    let phase = 0;
    const draw = () => {
      if (!ctx) return;
      phase += 0.04;
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(1, bgHex);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Soundwave animation
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      const waveRadius = 45 + Math.sin(phase) * 8;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, waveRadius, 0, Math.PI * 2);
      ctx.fill();

      // Avatar circle
      ctx.fillStyle = bgHex;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 38, 0, Math.PI * 2);
      ctx.fill();

      // Initials text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');
      ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

      // Name label banner at bottom
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.roundRect(16, canvas.height - 40, 200, 28, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(name, 28, canvas.height - 22);

      requestAnimationFrame(draw);
    };

    draw();
    return canvas.captureStream(24);
  }
}

// Singleton call provider instance ready for dependency injection or swap
export const callService = new MockCallProvider();
