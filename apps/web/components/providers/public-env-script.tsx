import { getPublicEnv } from "@/lib/env/public-env";

export function PublicEnvScript() {
  const env = getPublicEnv();

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__VERQIK_PUBLIC_ENV__=${JSON.stringify(env)}`,
      }}
    />
  );
}
