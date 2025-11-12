import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import chatRoute from "./routes/chat.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Issue short-lived JWT to trusted frontend only (checks APP_SECRET)
app.post("/auth/token", (req, res) => {
  const appSecret = req.header("X-App-Secret");
  if (!appSecret || appSecret !== (process.env.APP_SECRET || "")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = jwt.sign({ sub: "frontend" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1h"
  });
  res.json({ token, expires_in: process.env.JWT_EXPIRES || "1h" });
});

// Chat route
app.use("/api/chat", chatRoute);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`✅ Backend listening on :${port}`));
