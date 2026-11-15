import { createContactHandler } from "../contact-backend/server.mjs";

const handler = createContactHandler({
  env: { ...process.env, TRUST_PROXY: "true" },
  apiOnly: true,
});
export default function contact(req, res) {
  const url = new URL(req.url, "http://localhost");
  if (
    url.pathname === "/api/contact/status" ||
    url.searchParams.get("contact_status") === "1"
  ) {
    req.url = "/api/contact/status";
  } else {
    req.url = "/api/contact";
  }
  return handler(req, res);
}
