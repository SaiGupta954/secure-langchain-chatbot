# Streamlit Frontend (with session memory)

- Generates a persistent `session_id` (UUID) per user session
- Requests JWT via `/auth/token` then calls `/api/chat` with `X-Session-Id`
- Backend uses LangChain ConversationSummaryMemory keyed by session_id

## Streamlit Secrets
```
BACKEND_URL = "https://your-backend.onrender.com"
APP_SECRET = "the-same-app-secret-as-backend"
```
