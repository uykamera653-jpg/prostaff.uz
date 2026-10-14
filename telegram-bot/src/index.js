import "dotenv/config";
import { Bot, InlineKeyboard, session } from "grammy";

const token = process.env.BOT_TOKEN?.trim();
const adminChatId = process.env.ADMIN_CHAT_ID?.trim();
const brand = process.env.BOT_NAME?.trim() || "PROSTAFF";
if (!token) {
  console.error("Missing BOT_TOKEN. Copy .env.example to .env and add your BotFather token.");
  process.exit(1);
}

const bot = new Bot(token);
const T = {
  welcome: "Assalomu alaykum! 👋\n" + brand + " xizmat buyurtma qilish va ishga ariza berish platformasi.\nTanlang:",
  order: "🧹 Buyurtma berish", worker: "👷 Ishchi bo‘lish", operator: "🆘 Operator", faq: "ℹ️ Ma’lumot", lang: "🌐 Til", menu: "🏠 Bosh menyu",
  service: "Qaysi xizmat kerak?", city: "Qaysi shahar yoki hudud?", address: "Ish manzilini yozing. Aniq uy raqamini yuborish hozircha ixtiyoriy.",
  when: "Qaysi sana va vaqtda kerak? Masalan: 20-oktabr, 10:00. Operator tekshiradi.", count: "Nechta ishchi kerak? 1–50 oralig‘ida son kiriting.",
  details: "Ish haqida qisqacha yozing.", phone: "Telefon raqamingizni xalqaro formatda yuboring, masalan +998901234567.",
  name: "Ism-familiyangizni yozing.", skills: "Qaysi ishlarni bajara olasiz?", experience: "Tajribangizni yozing. Bo‘lmasa, “Yangi” deb yozing.",
  confirm: "Ma’lumotlarni tekshiring. Yuborishni tasdiqlaysizmi?", yes: "✅ Tasdiqlash va yuborish", no: "✖️ Bekor qilish",
  sent: "Rahmat! So‘rovingiz administratorga yuborildi. Bu yakuniy buyurtma tasdig‘i emas — operator siz bilan bog‘lanadi.",
  noAdmin: "Sinov rejimi: ADMIN_CHAT_ID sozlanmagani uchun so‘rov yuborilmadi.",
  cancel: "Jarayon bekor qilindi.", invalidCount: "1 dan 50 gacha bo‘lgan butun son kiriting.",
  invalidPhone: "Telefon raqamini xalqaro formatda yuboring, masalan +998901234567.",
  operatorSent: "Murojaatingiz administratorga yuborildi.", operatorNoAdmin: "Operator kanali hali sozlanmagan.",
  faqText: "PROSTAFF mijozlarga xizmat so‘rovi yuborish, ishchilarga esa ishga ariza qoldirish imkonini beradi.\n\nBu birinchi MVP. Operator so‘rovlarni tekshiradi. Bot to‘lov qabul qilmaydi va narx, buyurtma yoki ishga qabul qilishni avtomatik tasdiqlamaydi.",
  unknown: "Tushunmadim. Tugmalardan foydalaning yoki /start yuboring.",
  services: {clean:"Tozalash", repair:"Ta’mirlash", move:"Ko‘chirish", garden:"Bog‘ ishlari", other:"Boshqa xizmat"}
};

bot.use(session({ initial: () => ({ flow: null }) }));
function mainKeyboard() {
  return new InlineKeyboard().text(T.order, "menu:order").row()
    .text(T.worker, "menu:worker").row().text(T.operator, "menu:operator").row()
    .text(T.faq, "menu:faq");
}
async function showMenu(ctx) {
  ctx.session.flow = null;
  await ctx.reply(T.welcome, { reply_markup: mainKeyboard() });
}
function serviceKeyboard() {
  return new InlineKeyboard().text(T.services.clean, "service:clean").row()
    .text(T.services.repair, "service:repair").row().text(T.services.move, "service:move").row()
    .text(T.services.garden, "service:garden").row().text(T.services.other, "service:other");
}
function confirmKeyboard() {
  return new InlineKeyboard().text(T.yes, "flow:confirm").row().text(T.no, "flow:cancel");
}
function begin(ctx, type, data = {}) {
  ctx.session.flow = { type, step: type === "order" ? "city" : "name", data };
}
async function ask(ctx) {
  const f = ctx.session.flow;
  if (!f) return;
  const prompts = f.type === "order"
    ? {city:T.city, address:T.address, when:T.when, count:T.count, details:T.details, phone:T.phone}
    : {name:T.name, city:T.city, skills:T.skills, experience:T.experience, phone:T.phone};
  await ctx.reply(prompts[f.step] || T.unknown);
}
function validPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}
function summary(f) {
  const d = f.data;
  if (f.type === "order") return "🧾 BUYURTMA SO‘ROVI\nXizmat: " + d.service + "\nHudud: " + d.city + "\nManzil: " + d.address +
    "\nSana/vaqt: " + d.when + "\nIshchilar soni: " + d.count + "\nTafsilot: " + d.details + "\nTelefon: " + d.phone;
  return "👷 ISHCHI ARIZASI\nIsm: " + d.name + "\nHudud: " + d.city + "\nKo‘nikmalar: " + d.skills +
    "\nTajriba: " + d.experience + "\nTelefon: " + d.phone;
}
async function advance(ctx, value) {
  const f = ctx.session.flow;
  if (!f) return;
  const step = f.step;
  if (step === "count") {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 50) return ctx.reply(T.invalidCount);
    f.data.count = n;
  } else if (step === "phone") {
    if (!validPhone(value)) return ctx.reply(T.invalidPhone);
    f.data.phone = value.trim();
    f.step = "confirm";
    return ctx.reply(summary(f) + "\n\n" + T.confirm, { reply_markup: confirmKeyboard() });
  } else {
    f.data[step] = value.trim();
  }
  const orderNext = {city:"address", address:"when", when:"count", count:"details", details:"phone"};
  const workerNext = {name:"city", city:"skills", skills:"experience", experience:"phone"};
  f.step = (f.type === "order" ? orderNext : workerNext)[step];
  await ask(ctx);
}

bot.command("start", showMenu);
bot.command("menu", showMenu);
bot.command("cancel", async (ctx) => {
  ctx.session.flow = null;
  await ctx.reply(T.cancel, { reply_markup: mainKeyboard() });
});
bot.command("myid", async (ctx) => {
  await ctx.reply("Telegram chat ID: " + ctx.chat.id + "\nBu raqamni maxfiy saqlang.");
});
bot.callbackQuery("menu:order", async (ctx) => {
  await ctx.answerCallbackQuery();
  begin(ctx, "order");
  await ctx.reply(T.service, { reply_markup: serviceKeyboard() });
});
bot.callbackQuery(/^service:(clean|repair|move|garden|other)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.session.flow || ctx.session.flow.type !== "order") return;
  ctx.session.flow.data.service = T.services[ctx.match[1]];
  await ask(ctx);
});
bot.callbackQuery("menu:worker", async (ctx) => {
  await ctx.answerCallbackQuery();
  begin(ctx, "worker");
  await ask(ctx);
});
bot.callbackQuery("menu:faq", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(T.faqText, { reply_markup: mainKeyboard() });
});
bot.callbackQuery("menu:operator", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!adminChatId) return ctx.reply(T.operatorNoAdmin, { reply_markup: mainKeyboard() });
  const u = ctx.from;
  const msg = "🆘 OPERATOR MUROJAATI\nTelegram ID: " + u.id + "\nIsm: " + (u.first_name || "") +
    "\nUsername: " + (u.username ? "@" + u.username : "yo‘q");
  try {
    await bot.api.sendMessage(adminChatId, msg);
    await ctx.reply(T.operatorSent, { reply_markup: mainKeyboard() });
  } catch (e) {
    console.error("Operator notification failed:", e.message);
    await ctx.reply(T.operatorNoAdmin, { reply_markup: mainKeyboard() });
  }
});
bot.callbackQuery("flow:cancel", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.flow = null;
  await ctx.reply(T.cancel, { reply_markup: mainKeyboard() });
});
bot.callbackQuery("flow:confirm", async (ctx) => {
  await ctx.answerCallbackQuery();
  const f = ctx.session.flow;
  if (!f || f.step !== "confirm") return ctx.reply(T.unknown, { reply_markup: mainKeyboard() });
  if (!adminChatId) return ctx.reply(T.noAdmin, { reply_markup: mainKeyboard() });
  const u = ctx.from;
  const msg = summary(f) + "\n\nTelegram ID: " + u.id + "\nUsername: " + (u.username ? "@" + u.username : "yo‘q");
  try {
    await bot.api.sendMessage(adminChatId, msg);
    ctx.session.flow = null;
    await ctx.reply(T.sent, { reply_markup: mainKeyboard() });
  } catch (e) {
    console.error("Request forwarding failed:", e.message);
    await ctx.reply(T.noAdmin, { reply_markup: mainKeyboard() });
  }
});
bot.on("message:text", async (ctx) => {
  const value = ctx.message.text.trim();
  if (value.startsWith("/")) return ctx.reply(T.unknown, { reply_markup: mainKeyboard() });
  if (ctx.session.flow) return advance(ctx, value);
  await ctx.reply(T.unknown, { reply_markup: mainKeyboard() });
});
bot.catch((err) => console.error("Bot update error:", err.message));
console.log(brand + " Telegram bot starting...");
bot.start({ onStart: (info) => console.log("Bot @" + info.username + " is running with long polling.") });
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => bot.stop());
