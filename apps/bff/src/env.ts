const ENV_SCHEMA = {
  ENCRYPTION_SECRET_KEY: (v: string | undefined) => {
    if (!v) return "ENCRYPTION_SECRET_KEY is required";
    if (!/^[0-9a-fA-F]{64}$/.test(v))
      return "ENCRYPTION_SECRET_KEY must be a 64-character hex string";
    return undefined;
  },
};

function validateEnv() {
  const errors: Record<string, string> = {};

  for (const [key, validate] of Object.entries(ENV_SCHEMA)) {
    const error = validate(process.env[key]);
    if (error) {
      errors[key] = error;
    }
  }

  if (Object.keys(errors).length > 0) {
    const message = `Environment validation failed:\n${Object.entries(errors)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join("\n")}`;
    console.error(message);
    throw new Error(message);
  }
}

export function getBffEnv() {
  validateEnv();
  return {
    ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY!,
  };
}

export type BffEnv = ReturnType<typeof getBffEnv>;