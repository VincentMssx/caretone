import { Hono } from "hono";

const bff = new Hono();

bff.use("*", async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error("[BFF] Error:", err);
    return c.json(
      { error: "Internal Server Error", message: err.message },
      500
    );
  }
});

bff.get("/dashboard/transmissions", async (c) => {
  try {
    const encryptedMockData = {
      patient_id: "patient-1",
      encrypted_donnees: "2f3a:encrypted",
      encrypted_actions: "4d1b:encrypted",
      encrypted_resultats: "1c8f:encrypted",
    };

    const encryptionKey = process.env.ENCRYPTION_SECRET_KEY;

    if (!encryptionKey) {
      return c.json(
        { error: "Configuration Error", message: "Encryption key not configured" },
        500
      );
    }

    const decryptedForUI = {
      patient_id: encryptedMockData.patient_id,
      donnees: encryptedMockData.encrypted_donnees,
      actions: encryptedMockData.encrypted_actions,
      resultats: encryptedMockData.encrypted_resultats,
    };

    return c.json({ data: decryptedForUI });
  } catch (err) {
    console.error("[DASHBOARD] Error:", err);
    return c.json(
      { error: "Fetch Error", message: "Failed to retrieve transmissions" },
      500
    );
  }
});

Bun.serve({
  port: 3001,
  fetch: bff.fetch,
});