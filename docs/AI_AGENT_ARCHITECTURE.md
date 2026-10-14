# PROSTAFF AI Agent — Architecture (v1)

## 1. Goal

Build a secure AI-assisted staffing platform for housekeeping and cleaning services. The AI agent helps collect booking requirements, search eligible workers, explain status, and assist administrators. The deterministic backend—not the language model—remains authoritative for availability, pricing, permissions, payment state, and booking status.

## 2. Product surfaces

- Client: request a service, specify location/date/time/team size, review a proposed match, track the booking.
- Worker: maintain profile and skills, set availability, receive offers, accept/decline, view assigned work.
- Admin: verify workers, manage service catalog and pricing, resolve exceptions, review activity and reports.
- AI assistant: conversational entry point shared across surfaces, constrained by the signed-in user's role.

## 3. Proposed technology baseline

- Existing client applications: audit before choosing whether to preserve Flutter/PWA or consolidate.
- Backend: Firebase Cloud Functions (TypeScript) for authenticated server-side actions.
- Identity: Firebase Authentication.
- Database: Cloud Firestore.
- File uploads: Firebase Storage with strict authorization and file limits.
- Notifications: Firebase Cloud Messaging.
- AI: provider-agnostic LLM adapter called only from the backend; never expose provider API keys to a browser/mobile client.
- Source control and CI: GitHub; separate development and production Firebase projects.
- Observability: structured server logs, error reporting, and audit events.

Do not introduce a new frontend framework until the existing client, worker, and admin repositories have been inspected.

## 4. High-level flow

1. User authenticates.
2. Client sends a message/request to an authenticated backend endpoint.
3. Backend validates identity, role, rate limits, and input schema.
4. AI interprets the request and proposes a structured intent.
5. Backend validates the intent and calls allowlisted domain functions.
6. Backend reads/writes Firestore under server-side rules and records an audit event.
7. Client receives a structured response and, when appropriate, a notification.

The model must not receive unrestricted database access or execute arbitrary code. It cannot directly approve payments, change prices, assign a worker without eligibility checks, or finalize high-impact actions without the required confirmation.

## 5. Initial agent capabilities

### Phase A — read-only assistant
- Answer FAQs from approved PROSTAFF service and policy content.
- Explain how to place a booking.
- Collect missing booking fields.
- Escalate uncertain or sensitive cases to an administrator.

### Phase B — booking draft
- Produce a validated booking draft with service, location, requested time, duration/team size, and notes.
- Ask the user to confirm before submission.
- Create a booking only through a backend function after confirmation.

### Phase C — worker matching
- Filter by required skills, service area, active/verified status, availability, and schedule conflicts.
- Rank eligible candidates using transparent business criteria.
- Offer matches for worker/admin confirmation; never invent availability.

### Phase D — operations
- Booking status messages, reminders, cancellation workflow, and admin summaries.
- Payment and subscription integration only after pricing, provider, and refund policies are defined.

## 6. Suggested Firestore domain model

- users/{uid} — identity reference, role, locale, account status.
- workers/{workerId} — skills, verification status, service areas, profile details.
- workerAvailability/{availabilityId} — worker reference and time interval.
- serviceCatalog/{serviceId} — approved service names, rules, and pricing references.
- bookings/{bookingId} — customer, service, location, time, status, assigned worker IDs, price snapshot.
- conversations/{conversationId} and messages/{messageId} — minimal chat history and metadata, subject to retention rules.
- notifications/{notificationId} — delivery status and related entity.
- auditEvents/{eventId} — actor, action, target, timestamp, outcome; avoid storing unnecessary sensitive content.

Exact fields and indexes must be finalized against the existing applications and business rules before migration.

## 7. Initial backend function contracts

- createBookingDraft — validate and save a draft.
- confirmBooking — confirm a user-approved draft and create a booking.
- findEligibleWorkers — return only workers who pass deterministic filters.
- respondToWorkerOffer — accept or decline a worker offer.
- getBookingStatus — return status only when the caller is authorized.
- sendBookingNotification — send approved status notifications.
- handleAssistantMessage — orchestrate intent extraction and allowlisted tools.

All endpoints require authentication where appropriate, input validation, authorization checks, idempotency for retryable writes, rate limits, and tests.

## 8. Security requirements

- Enforce least-privilege Firestore and Storage rules.
- Keep secrets in server-side secret management; never commit credentials.
- Validate every AI-generated structured action against a schema and current database state.
- Verify authorization on every read/write; do not trust a client-supplied role.
- Use explicit confirmation for booking submission, cancellation, payments, and other consequential actions.
- Minimize conversation retention and redact sensitive data from logs.
- Test with the Firebase Emulator Suite before using production data.
- Keep development and production projects, credentials, and deployments separate.

## 9. Delivery milestones

1. Inventory existing repositories, apps, Firebase projects, rules, and current deployment workflow.
2. Approve domain model and booking lifecycle.
3. Add emulator-backed tests and secure backend foundation.
4. Launch read-only FAQ assistant in development.
5. Add booking-draft and confirmation flow.
6. Add worker matching and notifications.
7. Add admin tools, analytics, and controlled production rollout.

## 10. Acceptance criteria for the first usable release

- An authenticated user can ask a service question and receive an answer grounded in approved content.
- The assistant asks for missing required booking information rather than guessing.
- A booking is not created until the user confirms it.
- Worker matches are derived from current verified data and schedule checks.
- Unauthorized users cannot read another customer's or worker's private records.
- AI/provider failure does not corrupt bookings; the user receives a safe fallback or admin escalation.
- Automated tests cover authorization, validation, duplicate submissions, and booking state transitions.
