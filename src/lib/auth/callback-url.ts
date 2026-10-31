export const DEFAULT_CALLBACK_URL = "/dashboard";

const BASE_URL = new URL("http://app.local");

/**
 * Aceita apenas caminhos internos. A validação com URL garante que valores
 * absolutos ou protocol-relative não escapem da origem da aplicação, e a
 * checagem de caracteres de controle evita injeção de headers em redirects.
 */
export function getSafeCallbackUrl(
  value: FormDataEntryValue | string | null
): string {
  if (typeof value !== "string") return DEFAULT_CALLBACK_URL;

  const callbackUrl = value.trim();

  if (
    callbackUrl === "" ||
    callbackUrl === "/" ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\")
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(callbackUrl);
  } catch {
    return DEFAULT_CALLBACK_URL;
  }

  if (
    /[\r\n\t]/.test(callbackUrl) ||
    /[\r\n\t]/.test(decoded) ||
    decoded.startsWith("//") ||
    decoded.includes("\\")
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  try {
    const url = new URL(callbackUrl, BASE_URL);

    if (url.origin !== BASE_URL.origin) return DEFAULT_CALLBACK_URL;
    if (!url.pathname.startsWith("/")) return DEFAULT_CALLBACK_URL;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_CALLBACK_URL;
  }
}
