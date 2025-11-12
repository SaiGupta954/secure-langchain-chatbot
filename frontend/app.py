import os
import uuid
import requests
import streamlit as st

st.set_page_config(page_title="🧠 LangChain Memory Chatbot", layout="wide")

BACKEND_URL = st.secrets.get("BACKEND_URL", os.getenv("BACKEND_URL", ""))
APP_SECRET = st.secrets.get("APP_SECRET", os.getenv("APP_SECRET", ""))

if not BACKEND_URL or not APP_SECRET:
    st.error("Missing BACKEND_URL or APP_SECRET. Add them in Streamlit Secrets.")
    st.stop()

# Stable session id
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

@st.cache_data(ttl=300)
def issue_token() -> str:
    url = f"{BACKEND_URL.rstrip('/')}/auth/token"
    r = requests.post(url, headers={"X-App-Secret": APP_SECRET}, timeout=30)
    r.raise_for_status()
    return r.json().get("token","")

def chat_api(token: str, message: str):
    url = f"{BACKEND_URL.rstrip('/')}/api/chat"
    r = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Session-Id": st.session_state.session_id
        },
        json={"message": message},
        timeout=120
    )
    r.raise_for_status()
    return r.json()["reply"]

st.title("🧠 Secure LangChain Chatbot with Memory")
st.caption("ConversationSummaryMemory • JWT • Rate limiting • Env-protected keys")

if "messages" not in st.session_state:
    st.session_state.messages = []

for m in st.session_state.messages:
    with st.chat_message(m["role"]):
        st.markdown(m["content"])

user_msg = st.chat_input("Type your message…")

if user_msg:
    st.session_state.messages.append({"role":"user","content":user_msg})
    with st.chat_message("user"):
        st.markdown(user_msg)

    with st.chat_message("assistant"):
        placeholder = st.empty()
        placeholder.markdown("_Thinking…_")
        try:
            token = issue_token()
            reply = chat_api(token, user_msg)
            placeholder.markdown(reply)
            st.session_state.messages.append({"role":"assistant","content":reply})
        except Exception as e:
            placeholder.markdown(f"⚠️ Error: {e}")
