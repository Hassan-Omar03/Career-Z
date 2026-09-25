# CareerZ AI Integration Audit — 24 September 2026

## Audit result

This was a code, documentation, and live-network verification pass. Every external AI/translation URL found under `backend/src` was traced. Each public provider URL was called with a deliberately invalid key (or, for keyless MyMemory, a real small translation) to distinguish a reachable API from a dead/incorrect route. The configured database contained two AI credentials, both OpenAI: text (`gpt-5-nano`) and image (saved as retired `dall-e-3`). Both were then exercised through `backend/src/services/ai.service.js`, using the real encrypted credential lookup/decryption path.

Five stale defaults were found and corrected: Claude 3.5 Haiku, Gemini 1.5 Flash, DeepSeek Chat, DALL-E 3, and Meshy 4. Existing saved records using those identifiers are now resolved to supported replacements without requiring users to reconnect their keys. The OpenAI image service also now accepts either base64 image data or a temporary URL response.

## Provider status

| Provider | CareerZ purpose | Status after this pass | Verification and finding | Official reference |
|---|---|---|---|---|
| OpenAI Chat Completions | Text generation | **Working** | Invalid key returned structured 401. Real configured `gpt-5-nano` call through `aiService.generate()` returned the requested `CAREERZ_AI_OK`. | [Chat Completions API](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create) |
| Anthropic Claude | Text generation | **Fixed; no real key configured** | Endpoint/auth/body contract is correct. Default `claude-3-5-haiku-20241022` was retired on 19 February 2026; changed to `claude-haiku-4-5-20251001`. Invalid key returned structured 401. | [Messages API](https://platform.claude.com/docs/en/api/messages/create), [model deprecations](https://docs.anthropic.com/en/docs/about-claude/model-deprecations) |
| Google Gemini | Text generation | **Fixed; no real key configured** | Endpoint/body parser are current and invalid key returned Google `API_KEY_INVALID` 400. Default `gemini-1.5-flash` was shut down; changed to `gemini-3.5-flash`. Query-string API-key authentication remains accepted, although Google now recommends `x-goog-api-key`. | [GenerateContent](https://ai.google.dev/api/generate-content), [Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations) |
| DeepSeek | Text generation | **Fixed; no real key configured** | OpenAI-compatible request/response contract is correct. `deepseek-chat` was discontinued on 24 July 2026; changed to current `deepseek-flash`. Invalid key returned structured 401. | [Chat completion](https://api-docs.deepseek.com/api/create-chat-completion/), [model list](https://api-docs.deepseek.com/api/list-models/), [change log](https://api-docs.deepseek.com/updates/) |
| OpenAI Images | Image generation | **Working after fix** | The saved `dall-e-3` model no longer exists. The first real service call failed with that exact provider error. It is now mapped to `gpt-image-1-mini`; the second real call returned a valid PNG data URL (1,278,414 characters) through `aiService.generateImage()`. | [Images API](https://developers.openai.com/api/reference/cli/resources/images/methods/generate), [image guide](https://developers.openai.com/api/docs/guides/image-generation), [model catalog](https://platform.openai.com/docs/models) |
| Stability AI | Image generation | **Legacy but reachable; no real key configured** | `/v1/generation/.../text-to-image`, JSON body, Bearer auth and `artifacts[0].base64` match the legacy SDXL API. Invalid key returned structured 401, proving the route is live. SDXL 1.0 is now a legacy model; migration to Stable Image Core should be planned rather than silently changing request format. | [Stability developer platform](https://platform.stability.ai/), [current pricing/model catalog](https://platform.stability.ai/pricing) |
| Meshy | Text-to-3D | **Fixed; no real key configured** | `/openapi/v2/text-to-3d` create/get paths and Bearer auth are live (401 with invalid key). `meshy-4` and `art_style` were stale; default is now `latest`, and deprecated `art_style` is omitted. | [Text to 3D API](https://docs.meshy.ai/en/api/text-to-3d), [change log](https://docs.meshy.ai/en/api/changelog) |
| ElevenLabs | Voice/TTS | **Working contract; no real key configured** | Current `/v1/text-to-speech/{voice_id}`, `xi-api-key`, JSON body and binary response handling match the API. Invalid key returned structured 401. | [ElevenLabs API](https://elevenlabs.io/api), [authentication errors](https://elevenlabs.io/docs/help-center/technical/api-error-code-400-or-401) |
| Google Cloud TTS | Voice/TTS | **Working contract; no real key configured** | Current v1 endpoint, request fields, and `audioContent` parser match the API. Invalid key returned `API_KEY_INVALID` 400. | [text.synthesize](https://docs.cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize) |
| HeyGen | Avatar video | **Endpoint reachable; no real key configured** | V3 create endpoint accepted the route and returned structured 401 rather than 404. Polling uses the corresponding V3 video resource. A real create/poll output could not be verified because no HeyGen credential exists in the database. | [HeyGen API reference](https://developers.heygen.com/reference), [error codes](https://developers.heygen.com/docs/error-codes) |
| Runway | Animation/video | **Working contract; no real key configured** | `/v1/image_to_video`, Bearer auth, API-version header, `gen4.5`, ratio and duration match the current guide. Invalid key returned structured 401. Text-only operation is valid because Gen-4.5 permits omission of `promptImage`. | [Runway getting started](https://docs.dev.runwayml.com/guides/using-the-api/), [input constraints](https://docs.dev.runwayml.com/assets/inputs/) |
| MyMemory | Translation | **Working live** | Real keyless `en→ur` request returned HTTP 200 and `responseData.translatedText = سلام`. Code endpoint and parser are correct. | [MyMemory API specification](https://mymemory.translated.net/doc/spec.php) |
| LibreTranslate | Translation | **Code contract valid; instance not configured** | CareerZ correctly POSTs `/translate` with `q`, `source`, `target`, `format`, and optional `api_key`. No `LIBRETRANSLATE_URL` is configured, so there is no concrete server to probe. This is a self-hostable provider, not one universal production endpoint. | [LibreTranslate API](https://docs.libretranslate.com/guides/api_usage/) |
| Google Cloud Translation v2 | Translation fallback | **Working contract; no real key configured** | Current v2 URL/body/response parser match official docs. Invalid key returned `API_KEY_INVALID` 400. | [v2 translate method](https://docs.cloud.google.com/translate/docs/reference/rest/v2/translate) |

Paddle is a payment provider, not an AI provider. Its checkout/webhook code is therefore outside this AI-integration audit.

## Exact contracts implemented in CareerZ

### Text

- **OpenAI** — `POST https://api.openai.com/v1/chat/completions`; `Authorization: Bearer <key>` and JSON content type; body `{ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }`; reads `choices[0].message.content`. CareerZ deliberately sends no `temperature`, which avoids failures on newer reasoning-model families.
- **DeepSeek** — `POST https://api.deepseek.com/chat/completions`; same auth, body shape, and response path as the OpenAI-compatible interface.
- **Anthropic** — `POST https://api.anthropic.com/v1/messages`; headers `x-api-key`, `anthropic-version: 2023-06-01`, and JSON content type; body `{ model, max_tokens: 1500, system, messages: [{ role: "user", content }] }`; reads `content[0].text`.
- **Gemini** — `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=<key>`; body `{ contents: [{ role: "user", parts: [{ text }] }], systemInstruction: { parts: [{ text }] } }`; reads `candidates[0].content.parts[0].text`.

### Image and 3D

- **OpenAI Images** — `POST https://api.openai.com/v1/images/generations`; Bearer auth; body `{ model, prompt, n: 1, size: "1024x1024" }`. The parser now accepts `data[0].b64_json` or downloads `data[0].url` and converts it to a data URL. `response_format` was removed after the real configured route rejected it during this audit.
- **Stability AI** — `POST https://api.stability.ai/v1/generation/{model}/text-to-image`; Bearer auth plus JSON/JSON accept headers; body `{ text_prompts: [{ text: prompt }], samples: 1 }`; reads `artifacts[0].base64`.
- **Meshy** — `POST https://api.meshy.ai/openapi/v2/text-to-3d`; Bearer auth; body `{ mode: "preview", prompt, ai_model }`; reads task id from `result`. Status uses `GET /openapi/v2/text-to-3d/{taskId}` and reads `status`, `progress`, `model_urls.glb`, and `thumbnail_url`.

### Voice and video

- **ElevenLabs** — `POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}`; header `xi-api-key`; body `{ text, model_id }`; reads the binary MP3 response.
- **Google TTS** — `POST https://texttospeech.googleapis.com/v1/text:synthesize?key=<key>`; body `{ input: { text }, voice: { languageCode, ssmlGender: "NEUTRAL" }, audioConfig: { audioEncoding: "MP3" } }`; reads base64 `audioContent`.
- **HeyGen** — `POST https://api.heygen.com/v3/videos`; header `X-Api-Key`; body `{ type: "avatar", avatar_id, script, voice_id, resolution: "720p" }`; reads `data.video_id`. Status uses `GET /v3/videos/{videoId}` and reads `data.status` and `data.video_url`.
- **Runway** — `POST https://api.dev.runwayml.com/v1/image_to_video`; Bearer auth and `X-Runway-Version: 2024-11-06`; body `{ model: "gen4.5", promptText, ratio: "1280:720", duration: 5 }` plus optional `promptImage`; reads `id`. Status uses `GET /v1/tasks/{taskId}` and reads `status` and `output[0]`.

### Translation

- **MyMemory** — `GET https://api.mymemory.translated.net/get?q=<text>&langpair=en|<target>` plus optional `de`; reads `responseData.translatedText` and checks `responseStatus`/quota flags.
- **LibreTranslate** — `POST {LIBRETRANSLATE_URL}/translate`; body `{ q: texts, source: "en", target, format: "text", api_key? }`; reads `translatedText`.
- **Google Translation v2** — `POST https://translation.googleapis.com/language/translate/v2?key=<key>`; body `{ q: texts, source: "en", target, format: "text" }`; reads `data.translations[].translatedText`.

## Live evidence and limits

The invalid-key probe returned authentication/validation responses, never 404, for OpenAI text/image, Anthropic, Gemini, DeepSeek, Stability, Meshy, ElevenLabs, Google TTS, HeyGen, Runway, and Google Translate. This verifies that CareerZ's hostnames and endpoint paths are currently reachable. It does not prove successful paid generation for providers without a configured real key.

The database had no Claude, Gemini, DeepSeek, Stability, Meshy, ElevenLabs, Google TTS, HeyGen, or Runway credentials, and no LibreTranslate server URL. Those paths are therefore marked as contract/reachability verified rather than end-to-end output verified. OpenAI text and image are the only two paths that could honestly be marked end-to-end working in this environment; MyMemory was also verified live because it does not require a key.

The probe utilities are `frontend/audit/ai-invalid-key-probe.js`, `frontend/audit/ai-credential-inventory.cjs`, and `frontend/audit/ai-real-service-probe.cjs`. They never print decrypted keys. The first uses only a deliberately invalid audit token; the inventory excludes encrypted key fields; the real probe logs only output type, length, and a short non-secret output prefix.
