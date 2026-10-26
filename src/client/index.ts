/** Full-window animated background and feature-owned General settings row. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { BackgroundSettingsRow, type BackgroundSettingsInjected } from './BackgroundSettingsRow.tsx'
import { createBackgroundSettingsStore } from './settings-store.ts'
import { en, zh, type BackgroundKey } from './locales.ts'
import { AbyssScene } from './scene.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Text for the deep-sea background settings row. */
    'background.abyss': BackgroundKey
  }
}

const THEME_ID = 'dsh-abyss-jellyfish'
const STORAGE_KEY = 'dsh-background-style-plugin:settings'
const DEFAULT_INTENSITY = 65

const THEME_TOKENS = {
  '--dsw-alias-bg-base': 'rgb(5 14 34 / 0.48)',
  '--dsw-alias-bg-layer-1': 'rgb(9 22 47 / 0.72)',
  '--dsw-alias-bg-layer-2': 'rgb(12 27 55 / 0.8)',
  '--dsw-alias-bg-layer-3': 'rgb(15 31 58 / 0.87)',
  '--dsw-alias-bg-overlay': 'rgb(14 26 50 / 0.95)',
  '--dsw-alias-bg-module-platform': 'rgb(17 34 62 / 0.82)',
  '--dsw-alias-bg-document-preview': 'rgb(10 21 42 / 0.9)',
  '--dsw-alias-markdown-code-block': 'rgb(7 19 41 / 0.86)',
  '--dsw-alias-markdown-code-block-banner': 'rgb(12 26 53 / 0.9)',
  '--dsw-specific-sidebar-fill': 'rgb(7 18 42 / 0.68)',
  '--dsw-alias-label-primary': '#e9f3ff',
  '--dsw-alias-label-secondary': '#a8bfd9',
  '--dsw-alias-label-tertiary': '#8da9c9',
  '--dsw-alias-brand-primary': '#88cfff',
  '--dsw-alias-brand-text': '#a9dcff',
  '--dsw-alias-link': '#9ed8ff',
  '--dsw-alias-border-l1': 'rgb(174 216 255 / 0.1)',
  '--dsw-alias-border-l2': 'rgb(174 216 255 / 0.17)',
  '--dsw-alias-border-l3': 'rgb(174 216 255 / 0.23)',
  '--dsw-alias-border-l4': 'rgb(174 216 255 / 0.3)',
  '--dsw-alias-interactive-bg-hover': 'rgb(117 180 239 / 0.14)',
  '--dsw-alias-interactive-bg-active': 'rgb(117 180 239 / 0.22)',
} as const

const PLUGIN_STYLE = `
body[data-dsh-abyss] { background: #030817 !important; }
body[data-dsh-abyss] #root { position: relative; z-index: 1; }
body[data-dsh-abyss] canvas[data-dsh-abyss-canvas] {
  position: fixed; inset: 0; width: 100vw; height: 100vh;
  z-index: 0; pointer-events: none; display: block;
}
`

interface SavedSettings {
  enabled: boolean
  intensity: number
}

function readSettings(): SavedSettings {
  if (typeof localStorage === 'undefined') return { enabled: true, intensity: DEFAULT_INTENSITY }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { enabled: true, intensity: DEFAULT_INTENSITY }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { enabled: false, intensity: DEFAULT_INTENSITY }
    const record = parsed as Record<string, unknown>
    const intensity = typeof record.intensity === 'number' && Number.isFinite(record.intensity)
      ? Math.min(100, Math.max(0, Math.round(record.intensity / 5) * 5)) : DEFAULT_INTENSITY
    return { enabled: record.enabled === true, intensity }
  } catch (error) {
    // A browser may deny storage access or the saved JSON may be corrupt.
    void error
    return { enabled: false, intensity: DEFAULT_INTENSITY }
  }
}

function writeSettings(settings: SavedSettings): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    // The current page still works when storage is unavailable.
    void error
  }
}

/** Required DSH client services; their package edges are in dsh.client.inject. */
export const inject = ['theme', 'slots', 'locale', 'configForms']

/** Install the theme, scene and settings control for this client fiber. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register('background.abyss', { zh, en }), 'background-style: locales')
  const theme = ctx.theme
  ctx.effect(() => theme.register({ id: THEME_ID, colorScheme: 'dark', tokens: THEME_TOKENS }), 'background-style: theme')

  if (typeof document !== 'undefined') {
    ctx.effect(() => {
      const style = document.createElement('style')
      style.dataset.plugin = 'dsh-background-style-plugin'
      style.textContent = PLUGIN_STYLE
      document.head.append(style)
      return () => { style.remove() }
    }, 'background-style: canvas stylesheet')
  }

  const saved = readSettings()
  const store = createBackgroundSettingsStore()
  let bound: BoundActions<typeof store> | undefined
  let enabled = false
  let intensity = saved.intensity
  let previousPreference = 'system'
  let scene: AbyssScene | undefined
  let themeRestoreQueued = false

  const sync = (): void => { bound?.sync(enabled, intensity) }
  const persist = (): void => { writeSettings({ enabled, intensity }) }
  const disable = (restore: boolean): void => {
    if (!enabled) return
    enabled = false
    scene?.dispose()
    scene = undefined
    if (typeof document !== 'undefined') document.body.removeAttribute('data-dsh-abyss')
    if (restore && theme.getTheme().active.id === THEME_ID) theme.setTheme(previousPreference)
    sync()
  }
  const setEnabled = (next: boolean, save = true): void => {
    if (next === enabled) return
    if (!next) {
      disable(true)
    } else {
      previousPreference = theme.getTheme().active.id === THEME_ID ? 'system' : theme.getTheme().preference
      if (typeof document !== 'undefined') {
        const nextScene = new AbyssScene(intensity)
        document.body.setAttribute('data-dsh-abyss', '')
        scene = nextScene
      }
      enabled = true
      theme.setTheme(THEME_ID)
      sync()
    }
    if (save) persist()
  }
  const setIntensity = (next: number, save = true): void => {
    intensity = Math.min(100, Math.max(0, Math.round(next / 5) * 5))
    scene?.setIntensity(intensity)
    sync()
    if (save) persist()
  }

  ctx.on('theme/change', snapshot => {
    if (!enabled || snapshot.active.id === THEME_ID) return
    // Host settings can publish their durable preference after startup or
    // after unrelated writes. Keep the plugin's visible palette while it is
    // enabled, and remember the selected appearance for when it is disabled.
    previousPreference = snapshot.preference
    if (themeRestoreQueued) return
    themeRestoreQueued = true
    queueMicrotask(() => {
      themeRestoreQueued = false
      if (enabled && theme.getTheme().active.id !== THEME_ID) theme.setTheme(THEME_ID)
    })
  })
  if (typeof window !== 'undefined') {
    const onStorage = (event: StorageEvent): void => {
      if (event.key !== STORAGE_KEY) return
      const incoming = readSettings()
      setIntensity(incoming.intensity, false)
      setEnabled(incoming.enabled, false)
    }
    ctx.effect(() => {
      window.addEventListener('storage', onStorage)
      return () => { window.removeEventListener('storage', onStorage) }
    }, 'background-style: cross-tab sync')
  }

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'background-style',
    order: 12,
    store,
    locale: 'background.abyss',
    inject: (actions: BoundActions<typeof store>): BackgroundSettingsInjected => {
      bound = actions
      sync()
      return {
        setEnabled: value => { setEnabled(value) },
        setIntensity: value => { setIntensity(value) },
      }
    },
  }, BackgroundSettingsRow))

  ctx.effect(() => () => {
    disable(true)
    bound = undefined
  }, 'background-style: scene cleanup')
  if (saved.enabled) {
    // The built-in theme adopts its Host setting asynchronously on first boot.
    // Restore only after that shared form has a value, so adoption cannot
    // mistake our custom preference for an external theme change.
    const themeForm = ctx.configForms.get('ui-theme')
    const restore = (): void => {
      if (themeForm.getSnapshot().value === undefined) return
      unsubscribe()
      setEnabled(true, false)
    }
    const unsubscribe = themeForm.subscribe(restore)
    ctx.effect(() => unsubscribe, 'background-style: initial theme adoption')
    restore()
  }
}
