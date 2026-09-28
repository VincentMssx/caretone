import { Hono } from "hono";

const health = new Hono();

health.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

health.get("/ready", (c) => {
  const checks = {
    encryptionKey: !!process.env.ENCRYPTION_SECRET_KEY,
    openaiKey: !!process.env.OPENAI_API_KEY,
  };
  const ready = Object.values(checks).every(Boolean);
  return c.json(
    { ready, checks },
    ready ? 200 : 503
  );
});

export default health;