/**
 * Server-side environment variables with runtime validation.
 *
 * Uses lazy getters so variables are only checked when first accessed,
 * preventing build-time failures in preview deployments where secrets
 * are not yet available.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${name}\n` +
        `   See .env.example for the full list of required variables.`,
    );
  }
  return value;
}

/** Required server-side variable names. */
const SERVER_VARS = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
] as const;

/** Validated server environment variables (lazy – safe during build). */
export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get CLERK_SECRET_KEY() {
    return required("CLERK_SECRET_KEY");
  },
  get R2_ENDPOINT() {
    return required("R2_ENDPOINT");
  },
  get R2_ACCESS_KEY_ID() {
    return required("R2_ACCESS_KEY_ID");
  },
  get R2_SECRET_ACCESS_KEY() {
    return required("R2_SECRET_ACCESS_KEY");
  },
  get R2_BUCKET() {
    return required("R2_BUCKET");
  },
};

/**
 * Eagerly validate every required server-side variable.
 *
 * Call this once during server startup (e.g. via the Next.js
 * instrumentation hook) to surface **all** missing vars at once
 * instead of discovering them one request at a time.
 */
export function validateEnv(): void {
  const missing = SERVER_VARS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n` +
        missing.map((k) => `   - ${k}`).join("\n") +
        "\n\n" +
        `   Add them to .env (local) or to your Vercel project settings.\n` +
        `   See .env.example for placeholder values.`,
    );
  }
}
