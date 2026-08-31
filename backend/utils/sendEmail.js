const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
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
