# Secure LangChain AI Chatbot — Backend with Memory (Node.js)

- LangChain **ConversationSummaryMemory** per session
- Security: Helmet, CORS, rate limiting, short-lived JWT
- Keys in `.env` only (server-side)
- Client must send a `X-Session-Id` header (stable UUID per user)

## Local run
```bash
cp .env.example .env
npm install
npm run dev
curl http://localhost:8080/health
curl -s -X POST http://localhost:8080/auth/token -H "X-App-Secret: change-me-app-secret"
```
