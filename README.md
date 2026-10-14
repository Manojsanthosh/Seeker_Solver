# SolveBridge - Seeker & Solver Platform
## Appointment Scheduling & Live Video/Audio Sessions

SolveBridge is a modern, responsive, hybrid web and Android application connecting **Seekers** (individuals or teams needing technical issues resolved) with verified **Solvers** (credentialed specialists and engineers) through **appointment slot scheduling and live collaborative sessions**.

Built with **React 18 + Vite + TypeScript**, **Tailwind CSS + Radix UI + Lucide**, **React Router v6**, **React Hook Form + Zod**, **Zustand**, **Framer Motion**, **Recharts**, **Vite PWA**, and **Capacitor Android**.

---

## 🌟 Seed Demo Accounts

Use the pre-configured mock credentials to test both portals:

| Role | Email | Password | Features / Focus |
| :--- | :--- | :--- | :--- |
| **Seeker** | `seeker@demo.com` | `Demo@123` | Post problems in ₹ with IST availability windows, review appointment offers, book slots with escrow checkout, join live sessions, rate solvers |
| **Solver** | `solver@demo.com` | `Demo@123` | Browse problems matching weekly availability, offer 30-min appointment slots in ₹, conduct live video/audio calls, withdraw earnings via UPI/IFSC |

> **Tip:** You can also click the **"Auto-fill"** badge on the login screen, or switch roles at any time using the quick-toggle button in the dashboard topbar!

---

## 🇮🇳 Indian Currency & IST Timezone Rules

SolveBridge is built strictly for the Indian market:
- **Currency (INR / ₹)**:
  - Formatted using `formatINR(amount)` with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`.
  - Produces standard Indian digit groupings (e.g., `₹1,25,000`, `₹1,500`).
  - No dollars (`$`) or non-INR currency in UI or mock data.
- **Date & Time (IST)**:
  - Timezone: `Asia/Kolkata` (UTC+5:30).
  - 12-hour formatted timestamps (e.g., `"Fri, 17 Oct, 6:30 PM IST"`).
  - Availability windows: Morning (09:00 - 12:00), Afternoon (12:00 - 17:00), Evening (17:00 - 21:00), or Custom IST intervals.
- **Validation Rules**:
  - **Phone**: +91 with 10 digits starting with 6–9.
  - **UPI ID**: Validated with `^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$` (e.g., `ananya@okhdfcbank`, `rajesh@upi`).
  - **IFSC Code**: Standard 11-character format `^[A-Z]{4}0[A-Z0-9]{6}$` (e.g., `HDFC0001234`).

---

## 📅 End-to-End Appointment & Live Session Flow

1. **Seeker Posts a Problem**:
   - Title, category, description, and attachments.
   - Budget in ₹ (Fixed or Min-Max range).
   - Preferred session mode: **Chat only**, **Audio call**, or **Video call**.
   - Estimated duration: 15, 30, 45, 60, or 90 minutes.
   - Preferred availability: Target dates + time windows (Morning / Afternoon / Evening / Custom IST).
   - Urgency: Today / This week / Flexible.

2. **Solver Browses Problems & Availability Matching**:
   - Filter by category, budget in ₹, urgency, and session mode.
   - Problems matching the solver's configured weekly schedule automatically display a green **"Matches your availability"** badge.

3. **Solver Offers Appointment Slots (Replaces Proposals)**:
   - Solvers offer up to 5 specific 30-minute appointment slots.
   - Pre-highlights slots that overlap with the seeker's preferred availability as green **"Best match"**.
   - Session fee in ₹ with live transparent price breakdown:
     - `Session fee + Platform fee (10%) + GST (18% on platform fee) = Total payable in ₹`.
   - Optional 200-character introductory note.

4. **Seeker Reviews Offers**:
   - Located under **My Problems -> Problem Detail -> Offers tab**.
   - View solver photo, verification badge, rating, credentials, and offered slots as selectable chips.
   - Seeker can:
     - **Book a slot** (proceed to checkout).
     - **Request different time** (sends counter-request with alternative preferred windows).
     - **Message solver** (pre-booking chat).
     - **Decline offer**.

5. **Booking & Escrow Checkout**:
   - Slot summary and price breakdown in ₹.
   - Payment method placeholders: UPI (Google Pay, PhonePe, Paytm, Custom UPI ID), Cards, Netbanking, and Wallets.
   - **Escrow Guarantee**: Payment is securely held in escrow and released to the solver after the session is marked completed.
   - Post-payment confirmation with instant `.ics` calendar invite download and direct lobby shortcut.

6. **Sessions Module (`/app/sessions`)**:
   - Unified tabbed view: **Upcoming**, **Live now**, **Completed**, and **Cancelled**.
   - View toggle between **Cards view** and **Calendar/Agenda view**.
   - Countdown timer ("Starts in 2h 15m"); **Join** button activates 10 minutes prior to session start.
   - Reschedule request/accept modal and cancellation with ₹ refund policy.

7. **Pre-Join Lobby (`/app/sessions/:id/lobby`)**:
   - Real-time camera and microphone preview using WebRTC `getUserMedia`.
   - Device selector (camera, microphone, speaker).
   - Network connection indicator (latency & packet stability).
   - Android camera/mic permission denial handling with troubleshooting steps.

8. **Live Session Room (`/app/sessions/:id/room`)**:
   - **Desktop Layout**: Immersive dark video stage (`slate-950`) + right collapsible panel with tabs:
     - **Chat**: Real-time simulated messaging with typing indicator, timestamps, attachments, and emoji support.
     - **Files**: Shared workspace files.
     - **Notes**: Private autosaving notes only visible to the current user.
     - **Details**: Problem briefing, attendee credentials, and escrow status.
   - **Mobile Layout**: Full-screen video with floating self-view, bottom control bar, and slide-up bottom sheet chat.
   - **Adaptive Modes**:
     - *Video call*: Full video streams.
     - *Audio-only call*: Animated avatar sound-wave pulses.
     - *Chat-only session*: Full-width distraction-free chat interface.
   - **Session Controls**: Mic mute/unmute, Camera toggle, Mobile front/back camera switch, Screen sharing (desktop), Session timer with 5-minute warning banner, and "Extend Session" request with additional ₹ fee.

9. **End of Session & Settlement**:
   - Solver marks "Mark as solved" or "Needs follow-up".
   - Seeker confirms "Problem solved? Yes / No", rates 1–5 stars, writes review, and picks tags (*Clear explanation*, *On time*, *Patient*).
   - Escrow release notification: funds scheduled for solver payout within 24 hours.
   - Transcript and notes export.

---

## 🔌 WebRTC & `CallProvider` Architecture

SolveBridge abstracts all real-time call capabilities behind the `CallProvider` interface in [`src/services/callProvider.ts`](file:///c:/Kakashi/Front/src/services/callProvider.ts). This ensures zero vendor lock-in and seamless swaps for production WebRTC vendors.

### The `CallProvider` Interface
```typescript
export interface CallProvider {
  join(sessionId: string, userId: string, options: CallOptions): Promise<CallSessionState>;
  leave(): Promise<void>;
  toggleMic(enabled?: boolean): boolean;
  toggleCamera(enabled?: boolean): boolean;
  flipCamera?(): Promise<void>;
  startScreenShare(): Promise<MediaStream | null>;
  stopScreenShare(): void;
  getDevices(): Promise<MediaDeviceInfo[]>;
  switchDevice(kind: 'audioinput' | 'videoinput' | 'audiooutput', deviceId: string): Promise<void>;
  onStateChange(callback: (state: CallSessionState) => void): () => void;
  onParticipantJoined(callback: (participant: CallParticipant) => void): () => void;
  onParticipantLeft(callback: (participantId: string) => void): () => void;
}
```

### Swapping for Production Providers

The included `MockCallProvider` uses real standard browser `navigator.mediaDevices.getUserMedia` for authentic camera/mic hardware access, with synthetic color-bars/tone fallback when cameras are unavailable or denied.

To swap to an enterprise provider:
1. **LiveKit**:
   - Install `@livekit/components-react` and `livekit-client`.
   - In `src/services/callProvider.ts`, create `LiveKitCallProvider` implementing `CallProvider` using `Room.connect(wsUrl, token)`.
2. **Agora**:
   - Install `agora-rtc-sdk-ng`.
   - Implement `join()` using `agoraClient.join(appId, channel, token, uid)` and publish local audio/video tracks.
3. **Daily.co**:
   - Install `@daily-co/daily-js`.
   - Wrap `DailyIframe.createCallObject()`.
4. **Jitsi**:
   - Install `@jitsi/react-sdk` or connect via lib-jitsi-meet.

---

## 📱 Android Native App & Permissions (Capacitor)

SolveBridge runs natively on Android via Capacitor. Real-time video and audio sessions require camera and microphone permissions in the Android WebView.

### 1. `AndroidManifest.xml` Permissions
In `android/app/src/main/AndroidManifest.xml`, ensure the following permissions are present inside `<manifest>`:

```xml
<!-- Internet & Network -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- WebRTC Camera & Audio Permissions -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

### 2. Android WebView WebChromeClient Permission Request
For Android 6.0+ (API 23+) WebRTC in Capacitor, ensure your `MainActivity.java` grants permission requests from the WebView:

```java
package com.solvebridge.app;

import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Grant camera and microphone permissions to WebView
        this.getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });
    }
}
```

### 3. Graceful Denial Handling
If a user denies camera or microphone access, the Pre-Join Lobby (`SessionLobbyPage`) catches the `NotAllowedError` and presents step-by-step instructions:
- On Android Chrome / WebView: Click the **Site Settings / Lock icon** in the address bar -> Permissions -> Camera & Microphone -> **Allow**.
- On Android Device Settings: **Settings -> Apps -> SolveBridge -> Permissions -> Camera & Microphone -> Allow while using app**.

---

## 🚀 Running & Building

### 1. Development Server
```bash
npm install
npm run dev
```
Starts at `http://localhost:5173`.

### 2. Production Build & PWA
```bash
npm run build
npm run preview
```

### 3. Capacitor Android Build
```bash
# Build production web bundle
npm run build

# Add android directory if not yet added
npx cap add android

# Sync assets to native project
npx cap sync android

# Open in Android Studio or build APK
npx cap open android
```
Debug APK location: `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🛠️ Project Structure
```
src/
├── assets/                 # Icons and branding assets
├── components/
│   ├── ui/                 # Button, Input, PasswordInput, Select, TagInput, FileUpload,
│   │                       # Stepper, RoleToggle, StatCard, StatusBadge, DataTable, EmptyState, Toast
│   ├── appointments/       # OfferAppointmentModal (30-min slot grid, INR breakdown)
│   └── layout/             # Navbar, Footer, AppLayout, Sidebar, Topbar, BottomNav, MobileDrawer
├── features/
│   ├── auth/               # LoginForm, SeekerRegisterForm, SolverRegisterWizard
│   ├── landing/            # HeroSection, HowItWorksSection, RoleSplitSection, CategoriesSection
│   ├── seeker/             # SeekerOverview (Next session hero, stats in ₹), PostProblemForm
│   └── solver/             # SolverOverview (Earnings chart in ₹, next session hero), EarningsChart
├── pages/                  # LandingPage, LoginPage, RegisterPage,
│                           # SeekerDashboardPage, PostProblemPage, MyProblemsPage (Offers tab),
│                           # SolverDashboardPage, BrowseProblemsPage (Matches your availability badge),
│                           # MyOffersPage, AvailabilityPage (weekly schedule & overrides),
│                           # SessionsPage (Upcoming/Live/Completed/Cancelled),
│                           # SessionLobbyPage (device preview, Android guide),
│                           # SessionRoomPage (live video/audio/chat room, timer, notes),
│                           # CheckoutPage (UPI, cards, escrow in ₹, .ics invite download),
│                           # NotificationsPage, MessagesPage, EarningsPage, ProfilePage, SettingsPage
├── routes/                 # AppRoutes, ProtectedRoute (role-aware guards)
├── services/               # callProvider.ts (CallProvider interface + MockCallProvider),
│                           # api.ts (persisted mock services), mockAuth.ts
├── store/                  # authStore.ts, problemStore.ts
├── types/                  # Problem, Slot, Offer, Session, SolverAvailability, AppNotification, etc.
└── lib/                    # utils.ts (formatINR, formatISTDateTime, validateIndianPhone, validateUPI, validateIFSC, downloadICS)
```
