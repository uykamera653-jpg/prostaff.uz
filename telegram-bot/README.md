# PROSTAFF Telegram Bot

Telegram onboarding assistant for people applying to become PROSTAFF workers.

## Features
- Gets explicit consent before collecting personal data.
- Collects full name, city/area, phone, skills, experience and passport/ID images.
- Saves applications to Firestore collection `workerApplications`, with status `pending_review`.
- Uploads document images to Firebase Storage at `worker-applications/<applicationId>/`.
- Does not forward passport images to the admin Telegram chat; admin notifications contain application metadata only.
- If `OPENAI_API_KEY` is configured, answers general questions with an AI model; otherwise uses basic rule-based FAQ replies.
- Does not automatically hire workers or promise pay, shifts, or job assignments.

## Setup
- Node.js 20+
- Telegram bot token from @BotFather
- Firebase project with Firestore and Storage enabled
- Server-side Firebase service account with appropriate access
- Private admin Telegram chat ID (recommended)
- Optional OpenAI API key for AI answers

1. Copy `.env.example` to `.env`.
2. Set `BOT_TOKEN`, `ADMIN_CHAT_ID`, `FIREBASE_SERVICE_ACCOUNT_JSON` and `FIREBASE_STORAGE_BUCKET`.
3. Optionally set `OPENAI_API_KEY` and `OPENAI_MODEL` for AI answers.
4. Run `npm install` then `npm start`.
5. Open the bot and send `/start`.

Never commit `.env`, service-account JSON, bot tokens, API keys, or passport images. If credentials are exposed, revoke/rotate them.

## Personal-data safeguards
Keep the Storage bucket private and restrict Firestore/Storage access to trusted server/admin identities. Define a retention and deletion policy and explain to applicants how to request deletion. General questions may be sent to the configured AI provider when its key is enabled; tell users not to send passwords, payment-card details, or unrelated sensitive information in free-text questions. Passport/ID images are not sent to the AI provider. Confirm applicable personal-data laws and get legal review before production use.

## Limitations
- AI replies are for general information only; staff must confirm hiring, pay, bookings, and terms.
- In-progress conversations are in memory and reset if the process restarts.
- The new `workerApplications` collection has not yet been unified with the existing client/worker app schemas.
- Without Firebase server secrets, the bot will not submit worker applications.
