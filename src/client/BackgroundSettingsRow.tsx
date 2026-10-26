import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { createBackgroundSettingsStore } from './settings-store.ts'
import css from './BackgroundSettingsRow.module.css'

/** Settings writes supplied by the plugin body. */
export interface BackgroundSettingsInjected {
  setEnabled(enabled: boolean): void
  setIntensity(intensity: number): void
}

type Props = PropsRuntime<'settings.general.item'>
  & PropsStore<ReturnType<typeof createBackgroundSettingsStore>>
  & PropsLocale<'background.abyss'>
  & BackgroundSettingsInjected

/** Display the plugin toggle and animation strength in General settings. */
export function BackgroundSettingsRow({ t, useStore, setEnabled, setIntensity }: Props) {
  const enabled = useStore(state => state.enabled)
  const intensity = useStore(state => state.intensity)

  return <div className={css.row}>
    <div className={css.copy}>
      <div className={css.title}>{t('title')}</div>
      <div className={css.description}>{t('description')}</div>
    </div>
    <label className={css.toggle}>
      <input type="checkbox" checked={enabled} onChange={event => { setEnabled(event.currentTarget.checked) }} />
      <span>{t('enable')}</span>
    </label>
    <label className={css.slider}>
      <span>{t('intensity')}</span>
      <input type="range" min="0" max="100" step="5" value={intensity}
        onChange={event => { setIntensity(Number(event.currentTarget.value)) }} />
      <output>{intensity}%</output>
    </label>
  </div>
}
