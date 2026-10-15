import test from "node:test";
import assert from "node:assert/strict";
import {
  readConfig,
  validateContact,
  sendContact,
  TOPICS,
} from "./mailgun.mjs";
import { createContactServer } from "./server.mjs";
const env = {
  MAILGUN_API_KEY: "unit-test-only",
  MAILGUN_DOMAIN: "sandbox.example.org",
  MAIL_TO: "owner@example.org",
  MAIL_FROM: "postmaster@sandbox.example.org",
  ALLOWED_ORIGIN: "https://seevia.example",
};
const message = {
  name: "",
  email: "",
  topic: TOPICS[0],
  message: "Một lời nhắn tiếng Việt.",
  website: "",
};
test("validation preserves optional identity and rejects invalid input/header injection", () => {
  assert.ok(validateContact(message));
  for (const invalid of [
    { ...message, email: "bad\r\nBcc: attacker@example.org" },
    { ...message, name: "A\nB" },
    { ...message, message: " " },
    { ...message, message: "a".repeat(3001) },
    { ...message, topic: "arbitrary" },
    { ...message, name: {} },
  ])
    assert.equal(validateContact(invalid), null);
});
test("Mailgun uses fixed recipient, optional Reply-To, correct region, no tracking", async () => {
  const config = readConfig({ ...env, MAILGUN_REGION: "eu" });
  const id = await sendContact(
    { ...message, email: "visitor@example.org" },
    config,
    async (url, options) => {
      assert.equal(
        url,
        "https://api.eu.mailgun.net/v3/sandbox.example.org/messages",
      );
      assert.equal(options.body.get("to"), env.MAIL_TO);
      assert.equal(options.body.get("h:Reply-To"), "visitor@example.org");
      assert.equal(options.body.get("o:tracking"), "no");
      assert.ok(options.body.get("text").includes(message.message));
      return new Response(JSON.stringify({ id: "test-message" }), {
        status: 200,
      });
    },
  );
  assert.equal(id, "test-message");
  await assert.rejects(
    sendContact(
      message,
      config,
      async () => new Response("private-provider-detail", { status: 403 }),
    ),
    { message: "mailgun_http_403" },
  );
});
test("API rejects origins, malformed/large bodies, rate limits; does not expose credentials or let the client choose recipients", async (t) => {
  const sent = [];
  const server = createContactServer({
    env,
    fetchImpl: async (_url, options) => {
      sent.push(options.body);
      return new Response(JSON.stringify({ id: "test-message" }));
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, origin = "https://seevia.example") =>
    fetch(base + "/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  const status = await (await fetch(base + "/api/contact/status")).json();
  assert.deepEqual(status, { available: true });
  assert.equal((await post(message, "https://untrusted.example")).status, 403);
  assert.equal((await post("{")).status, 400);
  assert.equal((await post({ ...message, website: "bot" })).status, 400);
  assert.equal(
    (await post({ ...message, message: "a".repeat(17000) })).status,
    413,
  );
  assert.equal(
    (await post({ ...message, to: "attacker@example.org" })).status,
    200,
  );
  assert.equal(sent.length, 1);
  assert.equal(sent[0].get("to"), "owner@example.org");
  assert.equal((await post(message)).status, 200);
  assert.equal((await post(message)).status, 429);
  assert.equal((await fetch(base + "/.env")).status, 404);
});
test("unconfigured server reports unavailable and refuses sends", async (t) => {
  const server = createContactServer({ env: {} });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(base + "/api/contact/status")).json(), {
    available: false,
  });
  assert.equal(
    (await fetch(base + "/api/contact", { method: "POST" })).status,
    503,
  );
});
