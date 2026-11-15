# SeeVia Assistant — Cohere Command A

The current provider is Cohere Chat API V2 using `command-a-03-2025`. Provider migration changes only the server adapter, server environment names, and provider-specific verification. Conversation policy, local retrieval, curated knowledge, route registry, formatting, rate limits, widget UI, accessibility, and direct human contact remain in the existing implementation. Earlier Groq live-evaluation results are historical and do not verify Cohere.

Conversation behavior and known semantic limitations: [dynamic conversation audit](seevia-dynamic-conversation-audit.md). Grounding and canonical navigation: [verification audit](seevia-assistant-verification-audit.md).

## Server setup

Add these values to `D:/SeeVia/contact-backend/.env` on the server machine:

```dotenv
COHERE_API_KEY=your_server_side_key
COHERE_MODEL=command-a-03-2025
```

Get the key from Cohere's dashboard and keep it only in `contact-backend/.env` locally or the server environment variables in production. Do not put it in a `VITE_*` variable, frontend code, source control, or chat. The checked-in `contact-backend/.env.example` contains placeholders only. `.env` is ignored by Git. Restart the backend after changing these values.

Run locally in separate terminals:

```powershell
npm.cmd run server
npm.cmd run dev
npm.cmd run assistant:verify
```

`assistant:verify` makes real Cohere calls only when the server key is configured; the script sends a short multi-turn sequence and stops on the first provider or validation failure. It never retries or falls back to another provider. Cohere Command A is billed by usage according to the Cohere account/model plan; consult the current Cohere dashboard before enabling it publicly.

For Vercel, set `COHERE_API_KEY` and `COHERE_MODEL` as server environment variables, then redeploy. The shared limiter remains required: set `ASSISTANT_REDIS_REST_URL` and `ASSISTANT_REDIS_REST_TOKEN`; `ASSISTANT_RATE_SALT` is optional. Local Node uses the existing in-memory limiter. Do not enable `TRUST_PROXY` unless requests pass through the configured trusted proxy.

## Preserved assistant behavior

- Vietnamese answers use only locally retrieved, approved SeeVia knowledge and website content. The User Flow Spec is still draft material, not proof of implemented capabilities. The project is still described as developing and without a confirmed glasses prototype or commercial release.
- The existing prompt still requires polite correction of unsupported or false premises, distinguishes confirmed facts from uncertainty, and avoids inventing price, specifications, partnerships, certification, availability, or effectiveness. It does not position glasses as a replacement for mobility aids or orientation skills.
- Context remains bounded to the most recent six user/assistant messages (up to 800 characters each, 3,200 characters total). Current question and recent displayed suggestions are separate. Suggestions are generated with the answer in one model call; there are no scripted trees, starter question lists, or fallback suggestions.
- Navigation continues to use the shared registry for official page names and actual paths, including **Sản phẩm** at `/san-pham`. Recommendations require an explicit destination intent; the model cannot invent routes or navigate automatically.
- Answer JSON is parsed server-side and rendered with the existing safe Markdown renderer. Source, route, output size, input validation, rate limiting, timeout and error handling remain in place. Quota/provider errors do not trigger retries or alternate providers.
- The existing floating chat, accessibility behavior, burgundy styling, conversation memory, warning not to submit sensitive information, and direct `/lien-he` contact option remain unchanged.

Questions, bounded history and relevant retrieved SeeVia facts are sent to Cohere when the visitor submits. The chat does not save sessions in a database. The interface warning is not a technical block against sensitive data. Review Cohere's current privacy and retention terms for the selected account and deployment.

## Verification

`npm.cmd run test:assistant` uses mocked Cohere protocol responses to validate the endpoint shape, JSON schema, multi-turn history, grounding, navigation, rate limiting, quota handling and no-provider-fallback behavior. These fixtures do not prove authenticated Cohere inference. `npm.cmd run assistant:verify` is the explicit real-provider check and requires a valid server-side key. No authenticated Cohere response has been verified in this workspace unless that command completes successfully.

## Official Cohere references

- [Chat API V2 reference](https://docs.cohere.com/v2/reference/chat)
- [Get a model](https://docs.cohere.com/v2/reference/get-model)
- [Command A model and Vietnamese support](https://docs.cohere.com/docs/command-a)
- [Structured outputs](https://docs.cohere.com/v2/docs/structured-outputs)
