import express from "express";
import Chat from "../models/chat.model";

const router = express.Router();

// Load chat history
router.get("/:userId", async (req, res) => {
  const chat = await Chat.findOne({ userId: req.params.userId });
  res.json(chat || {});
});

// Save chat history
router.post("/save", async (req, res) => {
  const { userId, sessionId, messages } = req.body;
  await Chat.updateOne(
    { userId, sessionId },
    { userId, sessionId, messages },
    { upsert: true }
  );
  res.json({ success: true });
});

// Create new session
router.post("/new-session", async (req, res) => {
  const session = await Chat.create({
    userId: req.body.userId,
    sessionId: Date.now().toString(),
    messages: []
  });
  res.json(session);
});

// Load all sessions
router.get("/sessions/:userId", async (req, res) => {
  const sessions = await Chat.find({ userId: req.params.userId });
  res.json(sessions);
});

// Load specific session
router.get("/session/:sessionId", async (req, res) => {
  const session = await Chat.findOne({ sessionId: req.params.sessionId });
  res.json(session.messages || []);
});

export default router;
