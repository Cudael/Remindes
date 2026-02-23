/**
 * Next.js instrumentation hook – runs once when the server starts.
 *
 * This is the recommended place for one-time startup work such as
 * environment validation.  It does NOT run during `next build`, so
 * it will never break preview deployments that lack runtime secrets.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only validate on the Node.js server runtime (skip Edge).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/server/env");
    validateEnv();
  }
}
