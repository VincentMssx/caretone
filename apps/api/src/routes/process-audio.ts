import { Hono } from "hono";
import { z } from "zod";
import { encryptField } from "@carevoice/crypto";

const api = new Hono();

const ProcessAudioSchema = z.object({
  audio_url: z.string().url(),
  patient_id: z.string().min(1),
});

type ProcessAudioInput = z.infer<typeof ProcessAudioSchema>;

api.post("/v1/process-audio", async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = ProcessAudioSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        {
          error: "Validation Error",
          message: "Invalid request body",
          details: parseResult.error.flatten(),
        },
        400
      );
    }

    const { audio_url, patient_id } = parseResult.data;

    const rawDonnees = `Processed audio from ${audio_url} for patient ${patient_id}`;
    const encryptionKey = process.env.ENCRYPTION_SECRET_KEY;

    if (!encryptionKey) {
      return c.json(
        { error: "Configuration Error", message: "Encryption key not configured" },
        500
      );
    }

    const encryptedDonnees = encryptField(rawDonnees, encryptionKey);

    return c.json({
      status: "success",
      patient_id,
      encrypted_payload: encryptedDonnees,
    });
  } catch (err) {
    console.error("[PROCESS-AUDIO] Error:", err);
    return c.json(
      { error: "Processing Error", message: "Failed to process audio" },
      500
    );
  }
});

export default api;