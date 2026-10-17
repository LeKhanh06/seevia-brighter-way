import { createAssistantHandler } from "../contact-backend/assistant.mjs";
const handler = createAssistantHandler({
  env: { ...process.env, TRUST_PROXY: "true" },
});
export default function assistant(req, res) {
  const url = new URL(req.url, "http://localhost");
  req.url =
    url.pathname === "/api/assistant/status" ||
    url.searchParams.get("assistant_status") === "1"
      ? "/api/assistant/status"
      : "/api/assistant";
  return handler(req, res);
}
