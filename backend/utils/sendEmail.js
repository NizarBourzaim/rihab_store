const { Resend } = require("resend");

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail({ to, subject, html }) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured in environment variables. Email skipped.");
    return;
  }
  const recipients = Array.isArray(to)
    ? to
    : to.split(",").map((addr) => addr.trim()).filter(Boolean);

  const { error } = await resend.emails.send({
    from: "Rinifaza Store <onboarding@resend.dev>",
    to: recipients,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email via Resend");
  }
}

module.exports = { sendEmail };
