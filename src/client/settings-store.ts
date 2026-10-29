import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import { DEFAULT_COUNT, DEFAULT_INTENSITY } from './preferences.ts'

/** State mirrored into the settings row by this plugin. */
export interface BackgroundSettingsState {
  enabled: boolean
  intensity: number
  count: number
}

type BackgroundSettingsActions = {
  sync: (draft: BackgroundSettingsState, enabled: boolean, intensity: number, count: number) => void
}

/** Declare the settings row's only write path. */
export function createBackgroundSettingsStore(): EngineStoreHandle<BackgroundSettingsState, BackgroundSettingsActions> {
  return defineStore({
    init: (): BackgroundSettingsState => ({ enabled: false, intensity: DEFAULT_INTENSITY, count: DEFAULT_COUNT }),
    actions: {
      sync: (draft, enabled: boolean, intensity: number, count: number) => {
        draft.enabled = enabled
        draft.intensity = intensity
        draft.count = count
      },
    },
  })
}
