# PROSTAFF Telegram Bot

Telegram onboarding assistant for people applying to become PROSTAFF workers.

## Features
- Gets explicit consent before collecting personal data.
- Collects full name, city/area, phone, skills, experience and passport/ID images.
- Saves applications to Firestore collection `workerApplications`, with status `pending_review`.
- Uploads document images to Firebase Storage at `worker-applications/<applicationId>/`.
- Does not forward passport images to the admin Telegram chat; admin notifications contain application metadata only.
- Provides basic automatic FAQ answers and an operator contact path.

## Setup
- Node.js 20+
- Telegram bot token from @BotFather
- Firebase project with Firestore and Storage enabled
- Server-side Firebase service account with appropriate access
- Private admin Telegram chat ID (recommended)

1. Copy `.env.example` to `.env`.
2. Set `BOT_TOKEN`, `ADMIN_CHAT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON` and `FIREBASE_STORAGE_BUCKET`.
3. Run `npm install` then `npm start`.
4. Open the bot and send `/start`.

Never commit `.env`, service-account JSON, bot tokens, or passport images. If credentials are exposed, revoke/rotate them.

## Personal-data safeguards
Keep the Storage bucket private and restrict Firestore/Storage access to trusted server/admin identities. Define a retention and deletion policy and explain to applicants how to request deletion. Confirm applicable personal-data laws and get legal review before production use.

## Limitations
- This is an onboarding MVP, not yet a full generative AI assistant. FAQ answers are rule-based; an LLM provider still needs to be connected for open-ended answers.
- In-progress conversations are in memory and reset if the process restarts.
- The new `workerApplications` collection has not yet been unified with the existing client/worker app schemas.
- No automatic hiring, salary promise, payments, or job assignment.
- Without Firebase server secrets, the bot will not submit worker applications.
