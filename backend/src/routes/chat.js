import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { chatWithMemory } from "../lib/langchain.js";

const router = Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { message } = req.body || {};
    const sessionId = req.header("X-Session-Id");
    if (!sessionId) return res.status(400).json({ error: "Missing X-Session-Id" });
    if (!message) return res.status(400).json({ error: "Missing message" });

    const reply = await chatWithMemory(sessionId, message);
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Chat error" });
  }
});

export default router;
