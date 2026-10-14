# PROSTAFF Telegram Bot — MVP

The first Telegram intake bot for PROSTAFF. This is a workflow-based MVP, not yet an LLM-powered agent and not connected to the production booking database.

## Features
- Uzbek-language menu
- Service request intake: service, area, address, date/time, worker count, task details, phone
- Worker application intake: name, area, skills, experience, phone
- Operator request notifications
- Forwards confirmed requests to a configured admin chat
- Does not claim a booking or employment is final

## Requirements
- Node.js 20+
- A bot token from @BotFather
- Optional private Telegram admin chat ID

## Run locally
1. Copy .env.example to .env.
2. Add the token from @BotFather to BOT_TOKEN.
3. Run npm install, then npm start.
4. Open the bot in Telegram and send /start.
5. Send /myid to obtain your numeric chat ID. Set it as ADMIN_CHAT_ID in .env and restart the bot.

Never commit .env or share the bot token. If a token is exposed, revoke it through @BotFather and create a new one.

## Current limitations
- Session and unfinished forms are stored in process memory; restarting clears them.
- Requests are forwarded to the admin chat; there is no persistent database integration yet.
- The bot does not yet read/write the PROSTAFF PWA, Firebase, or Supabase data.
- No LLM is connected yet. Current workflows are deterministic.
- No payment, pricing decision, worker assignment, or final booking confirmation is automated.

## Next milestone
Choose the authoritative production data source (existing Firebase PWA or Supabase-backed Expo app). Then add persistent request storage and authenticated admin review before adding AI interpretation.
