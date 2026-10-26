import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'

/** State mirrored into the settings row by this plugin. */
export interface BackgroundSettingsState {
  enabled: boolean
  intensity: number
}

type BackgroundSettingsActions = {
  sync: (draft: BackgroundSettingsState, enabled: boolean, intensity: number) => void
}

/** Declare the settings row's only write path. */
export function createBackgroundSettingsStore(): EngineStoreHandle<BackgroundSettingsState, BackgroundSettingsActions> {
  return defineStore({
    init: (): BackgroundSettingsState => ({ enabled: false, intensity: 65 }),
    actions: {
      sync: (draft, enabled: boolean, intensity: number) => {
        draft.enabled = enabled
        draft.intensity = intensity
      },
    },
  })
}
