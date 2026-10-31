export interface ContentSecurityPolicyOptions {
  isProduction: boolean;
  s3Endpoint?: string | null;
}

function resolveOrigin(endpoint: string | null | undefined): string | null {
  if (!endpoint) return null;

  try {
    const url = new URL(endpoint);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

/**
 * O `'unsafe-inline'` permanece porque o Next.js injeta scripts de bootstrap
 * nas páginas; trocar por nonce exigiria renderização dinâmica de todo o app
 * (inclusive páginas estáticas) e quebraria o build atual. `'unsafe-eval'` é
 * restrito ao ambiente de desenvolvimento, onde o HMR precisa dele.
 */
export function buildContentSecurityPolicy({
  isProduction,
  s3Endpoint,
}: ContentSecurityPolicyOptions): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
  ].join(" ");

  const s3Origin = resolveOrigin(s3Endpoint);
  const connectSrc = ["'self'", ...(s3Origin ? [s3Origin] : [])].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' https: blob: data:",
    `connect-src ${connectSrc}`,
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
