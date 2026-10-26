/** Canvas scene kept separate from the DSH UI tree and all pointer handling. */
type Jellyfish = {
  x: number
  y: number
  size: number
  speed: number
  phase: number
  tint: number
}

const JELLYFISH: readonly Jellyfish[] = [
  { x: 0.24, y: 0.42, size: 0.115, speed: 9, phase: 0.08, tint: 0 },
  { x: 0.71, y: 0.27, size: 0.16, speed: 12, phase: 0.47, tint: 1 },
  { x: 0.89, y: 0.81, size: 0.09, speed: 7, phase: 0.7, tint: 0 },
  { x: 0.42, y: 0.94, size: 0.072, speed: 6, phase: 0.25, tint: 1 },
  { x: 0.06, y: 0.08, size: 0.082, speed: 8, phase: 0.85, tint: 1 },
  { x: 0.58, y: 0.63, size: 0.058, speed: 5, phase: 0.61, tint: 0 },
]

const DENSE = 'S%X8@#'
const SPARSE = "'.:o"
const STAR_COUNT = 125

function random(seed: number): number {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

function ease(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Owns one fixed canvas, its animation frame, and all environment listeners. */
export class AbyssScene {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D
  private readonly motion = matchMedia('(prefers-reduced-motion: reduce)')
  private readonly started = performance.now()
  private frame = 0
  private lastPaint = 0
  private width = 0
  private height = 0
  private intensity: number

  private readonly onResize = (): void => { this.resize() }
  private readonly onVisibility = (): void => { this.resume() }
  private readonly onMotion = (): void => { this.resume() }
  private readonly tick = (now: number): void => {
    if (now - this.lastPaint >= 30) {
      this.lastPaint = now
      this.paint((now - this.started) / 1000)
    }
    this.frame = requestAnimationFrame(this.tick)
  }

  /** Mount the background canvas and start only when motion is allowed. */
  constructor(intensity: number) {
    this.intensity = clamp(intensity, 0, 100)
    this.canvas = document.createElement('canvas')
    this.canvas.dataset.dshAbyssCanvas = ''
    this.canvas.setAttribute('aria-hidden', 'true')
    const context = this.canvas.getContext('2d', { alpha: false })
    if (context === null) throw new Error('The deep-sea background needs a 2D canvas context')
    this.context = context
    document.body.append(this.canvas)
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibility)
    this.motion.addEventListener('change', this.onMotion)
    this.resize()
    this.resume()
  }

  /** Change motion and glow strength without rebuilding the canvas. */
  setIntensity(intensity: number): void {
    this.intensity = clamp(intensity, 0, 100)
    this.resume()
  }

  /** Remove every resource owned by this plugin instance. */
  dispose(): void {
    cancelAnimationFrame(this.frame)
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.motion.removeEventListener('change', this.onMotion)
    this.canvas.remove()
  }

  private resize(): void {
    this.width = Math.max(1, window.innerWidth)
    this.height = Math.max(1, window.innerHeight)
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(this.width * ratio)
    this.canvas.height = Math.round(this.height * ratio)
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0)
    this.paint(this.motion.matches || this.intensity === 0 ? 0 : (performance.now() - this.started) / 1000)
  }

  private resume(): void {
    cancelAnimationFrame(this.frame)
    this.frame = 0
    if (document.hidden) return
    if (this.motion.matches || this.intensity === 0) {
      this.paint(0)
      return
    }
    this.frame = requestAnimationFrame(this.tick)
  }

  private paint(seconds: number): void {
    const ctx = this.context
    const { width, height } = this
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#030817'
    ctx.fillRect(0, 0, width, height)

    const bottomGlow = ctx.createRadialGradient(width * 0.5, height * 1.03, 0, width * 0.5, height * 1.03, Math.max(width, height) * 0.92)
    bottomGlow.addColorStop(0, '#123d66')
    bottomGlow.addColorStop(0.55, '#0a2346')
    bottomGlow.addColorStop(1, '#030817')
    ctx.fillStyle = bottomGlow
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(132, 185, 245, 0.025)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x < width; x += 27) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, height) }
    for (let y = 0; y < height; y += 27) { ctx.moveTo(0, y + 0.5); ctx.lineTo(width, y + 0.5) }
    ctx.stroke()

    this.drawStars(seconds)
    const motion = 0.4 + this.intensity / 100 * 0.8
    for (let i = 0; i < JELLYFISH.length; i += 1) {
      const jellyfish = JELLYFISH[i]
      if (jellyfish !== undefined) this.drawJellyfish(jellyfish, i, seconds * motion)
    }

    // Reading and typing zones stay quieter without duplicating DSH's own UI.
    const readingShade = ctx.createRadialGradient(width * 0.52, height * 0.48, 35, width * 0.52, height * 0.48, Math.max(280, width * 0.38))
    readingShade.addColorStop(0, 'rgba(3, 8, 23, 0.37)')
    readingShade.addColorStop(1, 'rgba(3, 8, 23, 0)')
    ctx.fillStyle = readingShade
    ctx.fillRect(0, 0, width, height)
  }

  private drawStars(seconds: number): void {
    const ctx = this.context
    const strength = 0.3 + this.intensity / 100 * 0.7
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '10px monospace'
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const x = random(i + 11) * this.width
      const shift = seconds * (1.4 + random(i + 400) * 3)
      const y = (random(i + 1000) * this.height - shift + this.height) % this.height
      const blink = 0.55 + 0.45 * Math.sin(seconds * (0.5 + random(i + 70)) + i)
      const alpha = (0.08 + 0.22 * blink) * strength
      ctx.fillStyle = `rgba(189, 222, 255, ${alpha})`
      ctx.fillText(i % 13 === 0 ? '*' : i % 9 === 0 ? '-' : i % 4 === 0 ? '·' : '.', x, y)
    }
  }

  private drawJellyfish(jellyfish: Jellyfish, index: number, seconds: number): void {
    const ctx = this.context
    const size = Math.max(42, Math.min(this.width, this.height) * jellyfish.size)
    const cycleProgress = seconds / (4.3 + index * 0.37) + jellyfish.phase
    const cycle = cycleProgress % 1
    const contraction = cycle < 0.23 ? ease(cycle / 0.23) : 1 - ease((cycle - 0.23) / 0.77)
    const bellWidth = size * (1 - contraction * 0.19)
    const bellHeight = size * 0.76 * (1 + contraction * 0.19)
    const driftX = Math.sin(seconds * 0.19 + index * 2.7) * size * 0.2
    const span = this.height + size * 3
    const pulseTravel = size * 0.2
    const pulsePhase = cycle < 0.23
      ? ease(cycle / 0.23) * 0.72
      : 0.72 + (1 - (1 - (cycle - 0.23) / 0.77) ** 2) * 0.28
    const pulseOffset = (Math.floor(cycleProgress) + pulsePhase) * pulseTravel
    const baseY = jellyfish.y * this.height - seconds * jellyfish.speed - pulseOffset
    const y = ((baseY + size * 1.5) % span + span) % span - size * 1.5
    const x = jellyfish.x * this.width + driftX
    const cell = Math.max(5, size / 12)
    const strength = (0.26 + this.intensity / 100 * 0.72) * (jellyfish.size < 0.08 ? 0.68 : 1)

    ctx.save()
    ctx.translate(x, y)
    ctx.globalAlpha = strength * (1 - contraction * 0.17)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const halo = ctx.createRadialGradient(0, -bellHeight * 0.25, 0, 0, -bellHeight * 0.25, bellWidth * 1.55)
    halo.addColorStop(0, jellyfish.tint === 0 ? 'rgba(108, 176, 255, 0.12)' : 'rgba(139, 142, 255, 0.12)')
    halo.addColorStop(1, 'rgba(58, 106, 204, 0)')
    ctx.fillStyle = halo
    ctx.fillRect(-bellWidth * 1.6, -bellHeight * 1.8, bellWidth * 3.2, bellHeight * 3)

    const rows = Math.ceil(bellHeight * 1.25 / cell)
    const columns = Math.ceil(bellWidth * 2 / cell)
    ctx.font = `${Math.max(5, cell * 0.61)}px monospace`
    for (let row = 0; row <= rows; row += 1) {
      const cy = -bellHeight + row * cell
      if (cy > bellHeight * 0.22) break
      for (let column = 0; column <= columns; column += 1) {
        const cx = -bellWidth + column * cell
        const nx = cx / bellWidth
        const ny = (cy + bellHeight * 0.16) / (bellHeight * 0.84)
        const radius = nx * nx + ny * ny
        if (radius > 1 || random(index * 3000 + row * 103 + column) < 0.075) continue
        const edge = radius > 0.74
        const light = clamp(1 - radius * 0.65 + random(row * 67 + column * 41) * 0.18, 0, 1)
        const gold = cy > -bellHeight * 0.02 && cy < bellHeight * 0.17 && Math.abs(nx) < 0.68
        const blue = jellyfish.tint === 0 ? '130, 185, 255' : '160, 160, 255'
        ctx.fillStyle = gold
          ? `rgba(241, 202, 136, ${0.12 + light * 0.34 + contraction * 0.1})`
          : `rgba(${blue}, ${edge ? 0.1 + light * 0.22 : 0.14 + light * 0.34})`
        if (!edge) ctx.fillRect(cx - cell * 0.43, cy - cell * 0.43, cell * 0.86, cell * 0.86)
        const glyphs = edge ? SPARSE : DENSE
        const choice = Math.floor(random(index * 7000 + row * 137 + column * 23 + Math.floor(seconds * 0.42)) * glyphs.length)
        ctx.fillStyle = gold ? 'rgba(255, 230, 177, 0.7)' : `rgba(218, 238, 255, ${edge ? 0.25 : 0.41 + light * 0.37})`
        ctx.fillText(glyphs[choice] ?? '.', cx, cy)
        if (!edge && random(row * 331 + column * 719 + index * 7) > 0.988) {
          ctx.shadowColor = '#dcefff'
          ctx.shadowBlur = 10
          ctx.fillStyle = 'rgba(248, 252, 255, 0.9)'
          ctx.fillText(random(row + column) > 0.5 ? '*' : '+', cx, cy)
          ctx.shadowBlur = 0
        }
      }
    }

    const tentacleCount = 11
    ctx.font = `${Math.max(5, cell * 0.66)}px monospace`
    for (let arm = 0; arm < tentacleCount; arm += 1) {
      const startX = (arm / (tentacleCount - 1) - 0.5) * bellWidth * 1.55
      const length = bellHeight * (0.65 + random(index * 30 + arm) * 0.9)
      const pink = arm % 3 === 0
      for (let step = 0; step < length / cell; step += 1) {
        const progress = step * cell / length
        const wave = Math.sin((seconds - progress * 0.75) * 0.95 + arm * 0.67 + progress * 5) * cell * progress * 1.7
        const tx = startX + wave + Math.sin(progress * 3 + index) * progress * cell
        const ty = bellHeight * 0.2 + step * cell
        ctx.fillStyle = pink
          ? `rgba(245, 184, 223, ${0.5 * (1 - progress)})`
          : `rgba(166, 222, 255, ${0.6 * (1 - progress)})`
        ctx.fillText(step % 5 === 0 ? 'o' : step % 2 === 0 ? ':' : '.', tx, ty)
      }
    }
    ctx.restore()
  }
}
