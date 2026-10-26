/** Chinese copy for the feature-owned General settings row. */
export const zh = {
  title: '深海字符水母',
  description: '让动态水母游过整个界面，同时使用深色半透明面板。',
  enable: '启用深海背景',
  intensity: '动效强度',
} satisfies Record<string, string>

export type BackgroundKey = keyof typeof zh

/** English copy with the same keys. */
export const en = {
  title: 'Deep-sea ASCII jellyfish',
  description: 'Animated jellyfish across the whole interface with dark translucent panels.',
  enable: 'Enable deep-sea background',
  intensity: 'Motion intensity',
} satisfies Record<BackgroundKey, string>
