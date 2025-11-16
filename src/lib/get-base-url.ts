export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return "http://localhost:3000";
}

export function getWebSocketUrl(): string {
  const baseUrl = getBaseUrl();
  const protocol = baseUrl.startsWith("https") ? "wss" : "ws";
  const host = baseUrl.replace(/^https?:\/\//, "");
  return `${protocol}://${host}`;
}
