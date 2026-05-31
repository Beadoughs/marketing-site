const { Resend } = require("resend");

const TO_EMAIL = "team@rcmarketingtas.com";
const FROM_EMAIL_DEFAULT = "RC Marketing <onboarding@resend.dev>";
const SANDBOX_FROM = "onboarding@resend.dev";

const FOCUS_LABELS = {
  "brand-development": "Brand Development",
  "website-design": "Website Design",
  "social-media": "Social Media",
  "content-creation": "Content Creation",
  "ai-implementation": "AI Implementation",
  "review-strategy": "Review Strategy",
};

function isDev() {
  return (
    process.env.VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development"
  );
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.RESEND_FROM || FROM_EMAIL_DEFAULT;
}

function isSandboxFrom(from) {
  return String(from).includes(SANDBOX_FROM);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailContent({ name, email, phone, business, focus }) {
  const focusLabel = focus ? FOCUS_LABELS[focus] || focus : "Not specified";
  const phoneLine = phone || "Not provided";
  const businessLine = business || "Not provided";

  const text = [
    "New website enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phoneLine}`,
    `Business: ${businessLine}`,
    `Focus area: ${focusLabel}`,
  ].join("\n");

  const html = `
    <h2>New website enquiry</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(phoneLine)}</td></tr>
      <tr><td><strong>Business</strong></td><td>${escapeHtml(businessLine)}</td></tr>
      <tr><td><strong>Focus area</strong></td><td>${escapeHtml(focusLabel)}</td></tr>
    </table>
  `.trim();

  return { text, html, focusLabel };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseRequestBody(req) {
  const raw = req.body;
  if (!raw) return {};
  if (typeof raw === "object" && !Buffer.isBuffer(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function jsonError(res, status, message, details) {
  const payload = { error: message };
  if (details && isDev()) payload.details = details;
  return res.status(status).json(payload);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return jsonError(
      res,
      503,
      "Email service is not configured. Please contact us directly at team@rcmarketingtas.com.",
      "Set RESEND_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy."
    );
  }

  const body = parseRequestBody(req);
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const business = String(body.business || "").trim();
  const focus = String(body.focus || "").trim();
  const website = String(body.website || "").trim();

  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!name) {
    return res.status(400).json({ error: "Please enter your name." });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const from = getFromAddress();
  if (isSandboxFrom(from)) {
    console.warn(
      "send-enquiry: using Resend sandbox sender. Verify rcmarketingtas.com and set RESEND_FROM to a verified address for production."
    );
  }

  const { text, html, focusLabel } = buildEmailContent({
    name,
    email,
    phone,
    business,
    focus,
  });

  const resend = getResendClient();

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `New website enquiry — ${name}`,
      text,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      const resendMessage =
        error.message || (typeof error === "string" ? error : "Unknown Resend error");
      const hint = isSandboxFrom(from)
        ? "Sandbox sender onboarding@resend.dev can only deliver to your Resend account email. Verify rcmarketingtas.com and set RESEND_FROM."
        : "Check that RESEND_FROM uses a verified domain in Resend.";
      return jsonError(
        res,
        502,
        "We couldn't send your enquiry right now. Please email team@rcmarketingtas.com.",
        `${resendMessage}. ${hint}`
      );
    }

    if (isDev()) {
      console.log("Enquiry sent:", data?.id);
    }

    return res.status(200).json({ success: true, focus: focusLabel });
  } catch (err) {
    console.error("Send enquiry failed:", err);
    return jsonError(
      res,
      500,
      "Something went wrong. Please try again or email team@rcmarketingtas.com.",
      err.message || String(err)
    );
  }
};
