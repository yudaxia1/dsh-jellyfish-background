export const DEFAULT_INTENSITY = 65
export const DEFAULT_COUNT = 6
export const MAX_COUNT = 12

export interface BackgroundPreferences {
  enabled: boolean
  intensity: number
  count: number
}

export function normalizeIntensity(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value / 5) * 5)) : DEFAULT_INTENSITY
}

export function normalizeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(MAX_COUNT, Math.max(0, Math.round(value))) : DEFAULT_COUNT
}

/** Missing count in older saved settings keeps the original six jellyfish. */
export function parsePreferences(raw: string | null): BackgroundPreferences {
  if (raw === null) return { enabled: true, intensity: DEFAULT_INTENSITY, count: DEFAULT_COUNT }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null) {
      const record = parsed as Record<string, unknown>
      return {
        enabled: record.enabled === true,
        intensity: normalizeIntensity(record.intensity),
        count: normalizeCount(record.count),
      }
    }
  } catch {
    // Corrupt preferences leave the background disabled until the user enables it.
  }
  return { enabled: false, intensity: DEFAULT_INTENSITY, count: DEFAULT_COUNT }
}
