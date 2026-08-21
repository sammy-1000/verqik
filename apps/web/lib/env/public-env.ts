const DEFAULT_WS_URL = "http://localhost:3001";

export type VerqikPublicEnv = {
  wsUrl: string;
};

declare global {
  interface Window {
    __VERQIK_PUBLIC_ENV__?: VerqikPublicEnv;
  }
}

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function getPublicEnv(): VerqikPublicEnv {
  if (typeof window !== "undefined" && window.__VERQIK_PUBLIC_ENV__) {
    return window.__VERQIK_PUBLIC_ENV__;
  }

  return {
    wsUrl:
      trimEnv(process.env.NEXT_PUBLIC_WS_URL) ?? DEFAULT_WS_URL,
  };
}

export function getWsUrl(): string {
  return getPublicEnv().wsUrl;
}
