import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const URL = "https://www.osssc.gov.in/";
const CHECK_WINDOW = 10 * 60 * 1000; // 10 minutes

let history = [];
let notified = false;

export default async function handler(req, res) {
  const now = Date.now();
  let success = false;

  try {
    const response = await fetch(URL, { method: "GET" });
    success = response.ok;
  } catch {
    success = false;
  }

  history.push({ time: now, success });

  // keep only last 10 minutes
  history = history.filter(h => now - h.time <= CHECK_WINDOW);

  const failures = history.filter(h => !h.success);

  // If stable for 10 minutes
  if (history.length >= 10 && failures.length === 0 && !notified) {
    await sendEmail();
    notified = true;
  }

  // reset if failure occurs
  if (failures.length > 0) {
    notified = false;
  }

  res.status(200).json({
    time: new Date(now).toISOString(),
    success,
    stable: failures.length === 0,
  });
}

async function sendEmail() {
  await resend.emails.send({
    from: "OSSSC Monitor <onboarding@resend.dev>",
    to: process.env.ALERT_EMAIL,
    subject: "🟢 OSSSC SERVER IS UP",
    text: "OSSSC website has been stable for 10+ minutes. You can try now.",
  });
}
