/** Validates JWT expiresIn values accepted by jsonwebtoken. */
export function parseJwtExpiresIn(
  value: string | undefined,
  fallback = '7d',
): string | number {
  const raw = value?.trim();
  if (!raw) return fallback;

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  if (/^\d+[smhdw]$/i.test(raw)) {
    return raw;
  }

  if (
    /^\d+\s+(second|seconds|minute|minutes|hour|hours|day|days|week|weeks|year|years)$/i.test(
      raw,
    )
  ) {
    return raw;
  }

  return fallback;
}

export function isValidJwtExpiresIn(value: string | undefined): boolean {
  const raw = value?.trim();
  if (!raw) return false;
  if (/^\d+$/.test(raw)) return true;
  if (/^\d+[smhdw]$/i.test(raw)) return true;
  return /^\d+\s+(second|seconds|minute|minutes|hour|hours|day|days|week|weeks|year|years)$/i.test(
    raw,
  );
}
