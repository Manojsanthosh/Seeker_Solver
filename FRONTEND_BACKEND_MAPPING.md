# SolveMate — Frontend to Backend API Mapping Document

This document defines the complete mapping between the frontend features, pages, components, and the backend REST API endpoints.

---

## 1. Authentication & Identity Management

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Seeker Registration | `/register` -> `SeekerRegisterForm.tsx` | `/api/v1/auth/register/seeker` | `POST` | `fullName`, `email`, `phone`, `password`, `city` (opt), `profilePhoto` (opt) | `{ "user": User, "access_token": string, "refresh_token": string }` | None (Public) | None | In Progress |
| 1.2 | Solver Multi-step Registration | `/register` -> `SolverStep1.tsx`, `SolverStep2.tsx`, `SolverStep3.tsx` | `/api/v1/auth/register/solver` | `POST` | `fullName`, `email`, `phone`, `password`, `city`, `bio`, `profilePhoto`, `highestQualification`, `fieldOfStudy`, `institution`, `completionYear`, `experienceYears`, `skills` (string[]), `certifications`, `documents`, `linkedIn` (opt), `instagram` (opt) | `{ "user": User, "access_token": string, "refresh_token": string }` | None (Public) | None | In Progress |
| 1.3 | User Login (Seeker / Solver / Admin) | `/login` -> `LoginPage.tsx` | `/api/v1/auth/login` | `POST` | `emailOrPhone`, `password`, `role` (`seeker` \| `solver` \| `admin`) | `{ "user": User, "access_token": string, "refresh_token": string }` | None (Public) | Role matched | In Progress |
| 1.4 | Token Refresh | Store auto-refresh on 401 / session restore | `/api/v1/auth/refresh` | `POST` | `{ "refresh_token": string }` | `{ "access_token": string, "refresh_token": string }` | Valid Refresh Token | Any authenticated role | In Progress |
| 1.5 | User Logout | Profile dropdown -> `logout` | `/api/v1/auth/logout` | `POST` | `{ "refresh_token": string }` (opt) | `{ "message": "Successfully logged out" }` | Bearer Token | Authenticated User | In Progress |
| 1.6 | Get Current User Context | `authStore.ts` -> `initialize()` | `/api/v1/auth/me` | `GET` | Headers: `Authorization: Bearer <token>` | `User` (including SeekerDetails or SolverDetails) | Bearer Token | Authenticated User | In Progress |

---

## 2. Problem Lifecycle Management

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 2.1 | Post a New Problem | `/app/seeker/post` -> `PostProblemPage.tsx` | `/api/v1/problems` | `POST` | `title`, `category`, `description`, `budgetType`, `budget`, `budgetMin` (opt), `budgetMax` (opt), `preferredMode` (`chat` \| `audio` \| `video`), `estimatedDuration` (15/30/45/60/90), `preferredAvailability` (PreferredWindow[]), `urgency`, `deadline`, `location` (opt), `attachments` (opt) | `Problem` object with initial status `open` and `offersCount: 0` | Bearer Token | Role: `seeker` | In Progress |
| 2.2 | Browse Problems (with Filters) | `/app/solver/browse` -> `BrowseProblemsPage.tsx` | `/api/v1/problems` | `GET` | Query params: `category`, `budget_min`, `budget_max`, `urgency`, `mode`, `status`, `search`, `page`, `limit` | `{ "items": Problem[], "total": number }` | Optional / Bearer Token | Open to all authenticated users | In Progress |
| 2.3 | Seeker My Problems List | `/app/seeker/problems` -> `MyProblemsPage.tsx` | `/api/v1/problems/my` (or `/api/v1/problems?seeker_id=me`) | `GET` | Query params: `status`, `page`, `limit` | `Problem[]` | Bearer Token | Role: `seeker` | In Progress |
| 2.4 | Problem Detail View | Modal / Detail drawer in `MyProblemsPage.tsx`, `BrowseProblemsPage.tsx` | `/api/v1/problems/{id}` | `GET` | Path param: `id` | `Problem` with seeker info and populated `offersCount` | Bearer Token | Open to authenticated users | In Progress |
| 2.5 | Update Problem Status | Actions in `problemStore.ts` | `/api/v1/problems/{id}/status` | `PATCH` | `{ "status": "open" \| "in_progress" \| "resolved" \| "closed" }` | `Problem` | Bearer Token | Owner Seeker or Admin | In Progress |
| 2.6 | Rule-Based Solver Matching | `PostProblemPage.tsx` -> Recommended Solvers modal / matching section | `/api/v1/problems/{id}/matches` | `GET` | Path param: `id` | `{ "matches": Array<{ solver: User, matchScore: number, matchReasons: string[], availabilityOverlap: boolean }> }` | Bearer Token | Owner Seeker, Solver, or Admin | In Progress |

---

## 3. Appointment Slot Offers (Replacing Proposals)

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 3.1 | Solver Submits Appointment Offer | `OfferAppointmentModal.tsx` in `BrowseProblemsPage.tsx` | `/api/v1/offers` | `POST` | `problemId`, `slots` (Slot[] max 5: date, startTime, endTime, isBestMatch), `mode`, `durationMinutes`, `sessionFee`, `note` (opt max 200 chars) | `Offer` object (with computed `platformFee` (10%), `gst` (18% on fee), `totalPayable`, status `sent`) | Bearer Token | Role: `solver` | In Progress |
| 3.2 | Seeker Views Offers on Problem | `OffersTab.tsx` in `MyProblemsPage.tsx` | `/api/v1/problems/{problem_id}/offers` | `GET` | Path param: `problem_id` | `Offer[]` with solver profile, ratings, qualification, slots | Bearer Token | Owner Seeker or Admin | In Progress |
| 3.3 | Solver Views Sent Offers | `/app/solver/offers` -> `MyOffersPage.tsx` | `/api/v1/offers/my` (or `/api/v1/offers?solver_id=me`) | `GET` | Query params: `status` | `Offer[]` | Bearer Token | Role: `solver` | In Progress |
| 3.4 | Update Offer Status | Actions in Seeker review / counter-request | `/api/v1/offers/{id}/status` | `PATCH` | `{ "status": "sent" \| "accepted" \| "declined" \| "rescheduled" }` | `Offer` | Bearer Token | Seeker (for accept/decline) or Solver | In Progress |

---

## 4. Bookings, Escrow, and Live Sessions

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 4.1 | Book Appointment Slot & Pay (Escrow) | `/app/checkout/:offerId/:slotId` -> `CheckoutPage.tsx` | `/api/v1/sessions/book` | `POST` | `offerId`, `slotId`, `paymentMethod` (`upi` \| `card` \| `netbanking` \| `wallet`), `mockPaymentDetails` | `Session` (status: `booked`, escrow payment created) | Bearer Token | Role: `seeker` (owner of problem) | In Progress |
| 4.2 | List Sessions (Upcoming, Live, Completed, Cancelled) | `/app/sessions` -> `SessionsPage.tsx` | `/api/v1/sessions` | `GET` | Query params: `status`, `role` (`seeker` \| `solver`) | `Session[]` with countdown text, slot, fees, counterpart info | Bearer Token | Authenticated participant | In Progress |
| 4.3 | Session Details & Pre-Join Lobby | `/app/sessions/:id/lobby` -> `SessionLobbyPage.tsx` | `/api/v1/sessions/{id}` | `GET` | Path param: `id` | `Session` with slot, status, permissions check, mode | Bearer Token | Session Seeker or Solver | In Progress |
| 4.4 | Live Session Room (WebRTC / Mode) | `/app/sessions/:id/room` -> `SessionRoomPage.tsx` | `/api/v1/sessions/{id}/room-state` | `GET` | Path param: `id` | `{ "session": Session, "roomToken": string, "canJoin": boolean }` | Bearer Token | Session Seeker or Solver | In Progress |
| 4.5 | Update Session Status (e.g. Join/Live) | `SessionRoomPage.tsx` | `/api/v1/sessions/{id}/status` | `PATCH` | `{ "status": "live" \| "completed" \| "cancelled" }` | `Session` | Bearer Token | Session Seeker or Solver | In Progress |
| 4.6 | Request Reschedule | Modal in `SessionsPage.tsx` / `SessionRoomPage.tsx` | `/api/v1/sessions/{id}/reschedule` | `POST` | `reason`, `newSlot` (Slot) | `Session` (status: `reschedule_requested`) | Bearer Token | Session Seeker or Solver | In Progress |
| 4.7 | Accept Reschedule | Action in `SessionsPage.tsx` | `/api/v1/sessions/{id}/accept-reschedule` | `POST` | (Empty body or confirm) | `Session` (status: `booked`, slot replaced) | Bearer Token | Counterpart user | In Progress |
| 4.8 | Cancel Session (Refund Calculation) | Modal in `SessionsPage.tsx` | `/api/v1/sessions/{id}/cancel` | `POST` | `reason` | `Session` (status: `cancelled`, refund policy evaluated, refund amount in ₹) | Bearer Token | Session Seeker or Solver | In Progress |
| 4.9 | Complete Session & Release Escrow | Modal in `SessionRoomPage.tsx` / `EndSessionModal.tsx` | `/api/v1/sessions/{id}/complete` | `POST` | `problemSolved`: boolean, `rating` (1-5), `review` (opt), `tags` (opt string[]) | `Session` (status: `completed`, payment released from escrow to solver payout) | Bearer Token | Session Seeker | In Progress |
| 4.10 | Save Private Session Notes | Notes tab in `SessionRoomPage.tsx` | `/api/v1/sessions/{id}/notes` | `POST` | `{ "notes": string }` | `Session` | Bearer Token | Authenticated session participant | In Progress |

---

## 5. Solver Availability & Weekly Schedules

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 5.1 | Get Solver Weekly Availability | `/app/solver/availability` -> `AvailabilityPage.tsx` | `/api/v1/solvers/{id}/availability` | `GET` | Path param: `id` (or `me` for current solver) | `SolverAvailability` (weeklySchedule, blockedDates, defaultFeePer30Min, preferredModes) | Bearer Token | Solver (for own) / Public (for discovery) | In Progress |
| 5.2 | Update Solver Availability | `/app/solver/availability` -> `AvailabilityPage.tsx` | `/api/v1/solvers/me/availability` | `PUT` | `weeklySchedule` (WeeklyDaySchedule[]), `blockedDates` (string[]), `defaultFeePer30Min`, `preferredModes` | Updated `SolverAvailability` | Bearer Token | Role: `solver` | In Progress |

---

## 6. Payments, Escrow, and Payout Withdrawals

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 6.1 | Seeker Payment Records | `/app/payments` -> `EarningsPage.tsx` (Seeker view) | `/api/v1/payments/seeker` | `GET` | Query params: `page`, `limit` | `PaymentRecord[]` (Escrow, Paid, Refunded) | Bearer Token | Role: `seeker` | In Progress |
| 6.2 | Solver Payout Records & Earnings | `/app/solver/earnings` -> `EarningsPage.tsx` (Solver view) | `/api/v1/payments/solver-payouts` | `GET` | Query params: `page`, `limit` | `{ "payouts": PaymentRecord[], "totalEarnings": number, "availableBalance": number, "inEscrow": number }` | Bearer Token | Role: `solver` | In Progress |
| 6.3 | Request Payout Withdrawal | Withdrawal modal in `EarningsPage.tsx` | `/api/v1/payments/withdraw` | `POST` | `amount`, `method` (`upi` \| `bank`), `destination` (e.g. UPI ID or Account Number) | `PaymentRecord` with status `Paid` / `Processing` | Bearer Token | Role: `solver` | In Progress |

---

## 7. Real-Time Messages & Chat

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 7.1 | List Conversations / Contacts | `/app/messages` -> `MessagesPage.tsx` | `/api/v1/messages/conversations` | `GET` | None | `Array<{ id: string, participant: User, lastMessage: ChatMessage, unreadCount: number }>` | Bearer Token | Authenticated User | In Progress |
| 7.2 | Get Conversation Messages | `/app/messages` & `SessionRoomPage.tsx` Chat Tab | `/api/v1/messages/conversation/{id}` | `GET` | Query params: `page`, `limit` | `ChatMessage[]` | Bearer Token | Participant of conversation | In Progress |
| 7.3 | Send Chat Message | `/app/messages` & `SessionRoomPage.tsx` | `/api/v1/messages` | `POST` | `conversationId` (or `recipientId` / `sessionId`), `text`, `attachment` (opt) | `ChatMessage` | Bearer Token | Authenticated User | In Progress |

---

## 8. In-App Notifications

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 8.1 | Get User Notifications | `/app/notifications` -> `NotificationsPage.tsx` | `/api/v1/notifications` | `GET` | None | `AppNotification[]` | Bearer Token | Authenticated User | In Progress |
| 8.2 | Mark All Notifications as Read | Mark all button in `NotificationsPage.tsx` | `/api/v1/notifications/mark-read` | `POST` | None | `{ "success": true }` | Bearer Token | Authenticated User | In Progress |

---

## 9. Solver Directory & Discovery

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 9.1 | List Solvers (Search & Categories) | Recommended Solvers carousel & Browse solvers | `/api/v1/solvers` | `GET` | Query params: `search`, `category`, `skill`, `min_rating`, `verified`, `sort` | `{ "items": User[], "total": number }` | Optional / Bearer Token | Open | In Progress |
| 9.2 | Get Solver Public Profile | Profile modal / view in Browse & Offers | `/api/v1/solvers/{id}` | `GET` | Path param: `id` | `User` with full `SolverDetails` and `Review[]` | Optional / Bearer Token | Open | In Progress |
| 9.3 | List Problem Categories | Landing page & Post Problem category picker | `/api/v1/categories` | `GET` | None | `Category[]` with problem counts and icons | Optional (Public) | Open | In Progress |

---

## 10. Platform Administration & Governance (Admin Role)

| # | Frontend Feature | Existing Route / Component | Required Backend Endpoint | HTTP Method | Request Fields | Expected Response | Authentication Requirements | Required Authorization | Implementation Status |
|---|---|---|---|---|---|---|---|---|---|
| 10.1 | Admin Platform Metrics & Stats | `/app/admin` (Dashboard) | `/api/v1/admin/stats` | `GET` | None | `{ "totalUsers": number, "totalSeekers": number, "totalSolvers": number, "totalProblems": number, "totalSessions": number, "totalEscrowHoldings": number, "totalPlatformRevenue": number }` | Bearer Token | Role: `admin` | In Progress |
| 10.2 | Admin Manage Users | `/app/admin/users` | `/api/v1/admin/users` | `GET` | Query params: `role`, `search`, `page`, `limit` | `{ "items": User[], "total": number }` | Bearer Token | Role: `admin` | In Progress |
| 10.3 | Admin Verify Solver Qualifications | Verification button in admin interface | `/api/v1/admin/solvers/{id}/verify` | `PATCH` | `{ "verified": boolean, "notes": string }` | `User` | Bearer Token | Role: `admin` | In Progress |
| 10.4 | Admin Manage Disputes / Sessions | `/app/admin/sessions` | `/api/v1/admin/sessions` | `GET` | Query params: `status`, `page`, `limit` | `{ "items": Session[], "total": number }` | Bearer Token | Role: `admin` | In Progress |

---

## Summary of Currency & Timezone Conventions
- **Currency:** All monetary values are strictly in **Indian Rupees (INR, ₹)** as integers or decimals. No other currencies are accepted.
- **Timezone:** All timestamps sent and displayed are ISO 8601 strings, converted and formatted to **IST (Asia/Kolkata)** for user display (12-hour format e.g. "Fri, 17 Oct, 6:30 PM IST").
- **Pricing Breakdown Formula:**
  $$\text{Session Fee (₹)} + \text{Platform Fee (10\%)} + \text{GST (18\% on Platform Fee)} = \text{Total Payable (₹)}$$
