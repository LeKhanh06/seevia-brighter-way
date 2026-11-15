export const TOPICS = [
  "Góp ý trải nghiệm",
  "Đồng hành & hợp tác",
  "Tìm hiểu dự án",
  "Chia sẻ câu chuyện",
];
const emailPattern = /^[^\s<>@,;\r\n]+@[^\s<>@,;\r\n]+\.[^\s<>@,;\r\n]+$/;
export function validateContact(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { name = "", email = "", topic, message, website = "" } = body;
  if (
    ![name, email, topic, message, website].every(
      (value) => typeof value === "string",
    )
  )
    return null;
  if (
    name.length > 100 ||
    email.length > 200 ||
    message.length > 3000 ||
    !name.trim() ||
    !email.trim() ||
    !message.trim() ||
    !TOPICS.includes(topic)
  )
    return null;
  if (!emailPattern.test(email.trim())) return null;
  if (/[\r\n]/.test(name)) return null;
  return {
    name: name.trim(),
    email: email.trim(),
    topic,
    message: message.trim(),
    website: website.trim(),
  };
}
export function readConfig(env = process.env) {
  const domain = env.MAILGUN_DOMAIN?.trim() ?? "";
  const region = env.MAILGUN_REGION || "us";
  const recipient = env.MAIL_TO?.trim() ?? "";
  const from = env.MAIL_FROM?.trim() || `postmaster@${domain}`;
  const apiKey = env.MAILGUN_API_KEY?.trim() ?? "";
  return {
    domain,
    region,
    recipient,
    from,
    apiKey,
    ready: Boolean(
      apiKey &&
      /^[a-z\d.-]+$/i.test(domain) &&
      domain.includes(".") &&
      emailPattern.test(recipient) &&
      emailPattern.test(from) &&
      ["us", "eu"].includes(region),
    ),
  };
}
export async function sendContact(data, config, fetchImpl = fetch) {
  if (!config.ready) throw new Error("mail_not_configured");
  const body = new FormData();
  body.set("from", `SeeVia <${config.from}>`);
  body.set("to", config.recipient);
  body.set("subject", `[SeeVia] ${data.topic}`);
  body.set(
    "text",
    `LỜI NHẮN TỪ WEBSITE SEEVIA\n\nChủ đề: ${data.topic}\nTên: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
  );
  body.set("h:Reply-To", data.email);
  body.set("o:tracking", "no");
  body.set("o:tracking-clicks", "no");
  body.set("o:tracking-opens", "no");
  const base =
    config.region === "eu"
      ? "https://api.eu.mailgun.net"
      : "https://api.mailgun.net";
  const response = await fetchImpl(`${base}/v3/${config.domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`,
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    // Never log provider bodies: they can contain addresses or request details.
    const error = new Error(`mailgun_http_${response.status}`);
    error.status = response.status;
    throw error;
  }
  const result = await response.json();
  if (!result.id) throw new Error("mailgun_invalid_response");
  return result.id;
}
