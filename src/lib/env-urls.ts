function readEnv(name: string): string {
  return (process.env[name] ?? "").replace(/\/$/, "");
}

export function siteUrl(path = ""): string {
  const base = readEnv("NEXT_PUBLIC_CLIENT_URL");
  if (!path || path === "/") {
    return base;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(fileName: string): string {
  return `${readEnv("NEXT_PUBLIC_MEDIA_URL")}/telexprodbucket/public/og-images/${fileName}`;
}

export function contactSalesUrl(): string {
  return `${readEnv("NEXT_PUBLIC_BASE_URL")}/contact`;
}

export function appStoreUrl(): string {
  return readEnv("NEXT_PUBLIC_APP_STORE_URL");
}

export function playStoreUrl(): string {
  return readEnv("NEXT_PUBLIC_PLAY_STORE_URL");
}

export function gtmScriptUrl(): string {
  return readEnv("NEXT_PUBLIC_GTM_SCRIPT_URL");
}

export function ipifyUrl(): string {
  return readEnv("NEXT_PUBLIC_IPIFY_URL");
}

export function ipapiUrl(): string {
  return readEnv("NEXT_PUBLIC_IPAPI_URL");
}

export function officeEmbedUrl(fileUrl: string): string {
  const base = readEnv("NEXT_PUBLIC_OFFICE_EMBED_URL");
  return `${base}?src=${encodeURIComponent(fileUrl)}`;
}

export function uiAvatarUrl(name: string): string {
  return `${readEnv("NEXT_PUBLIC_UI_AVATARS_URL")}?name=${encodeURIComponent(name)}`;
}

export function instagramUrl(): string {
  return readEnv("NEXT_PUBLIC_INSTAGRAM_URL");
}

export function tiktokUrl(): string {
  return readEnv("NEXT_PUBLIC_TIKTOK_URL");
}

export function facebookUrl(): string {
  return readEnv("NEXT_PUBLIC_FACEBOOK_URL");
}

export function xUrl(): string {
  return readEnv("NEXT_PUBLIC_X_URL");
}
