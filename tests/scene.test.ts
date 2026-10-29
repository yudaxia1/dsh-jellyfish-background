import assert from 'node:assert/strict'
import test from 'node:test'
import { AbyssScene } from '../src/client/scene.ts'

function environment() {
  const originals = new Map<string, PropertyDescriptor | undefined>()
  const install = (key: string, value: unknown) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  }
  const listeners = new Map<string, () => void>()
  const frames = new Map<number, (now: number) => void>()
  let nextFrame = 0
  const canvases: ReturnType<typeof canvas>[] = []
  const mounted: ReturnType<typeof canvas>[] = []
  function canvas() {
    const positions: number[][] = []
    const stars: number[] = []
    let depth = 0
    const gradient = () => ({ addColorStop() {} })
    const context = {
      positions, stars,
      setTransform() {}, createRadialGradient: gradient,
      fillRect() {}, drawImage() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
      save() { depth += 1 }, restore() { depth -= 1 },
      translate(x: number, y: number) { positions.push([x, y]) },
      fillText(_glyph: string, _x: number, y: number) { if (depth === 0) stars.push(y) },
    }
    const element = {
      width: 0, height: 0, dataset: {}, context,
      setAttribute() {}, getContext: () => context,
      remove() { mounted.splice(mounted.indexOf(element), 1) },
    }
    return element
  }
  const doc = {
    hidden: false,
    createElement() { const element = canvas(); canvases.push(element); return element },
    body: { append(element: ReturnType<typeof canvas>) { mounted.push(element) } },
    addEventListener(name: string, listener: () => void) { listeners.set(name, listener) },
    removeEventListener(name: string) { listeners.delete(name) },
  }
  install('document', doc)
  install('window', {
    innerWidth: 1200, innerHeight: 800, devicePixelRatio: 2,
    addEventListener(name: string, listener: () => void) { listeners.set(name, listener) },
    removeEventListener(name: string) { listeners.delete(name) },
  })
  install('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  install('requestAnimationFrame', (callback: (now: number) => void) => {
    frames.set(++nextFrame, callback)
    return nextFrame
  })
  install('cancelAnimationFrame', (id: number) => { frames.delete(id) })
  return {
    doc, canvases, mounted, frames,
    visibility() { listeners.get('visibilitychange')?.() },
    step(now: number) {
      const pending = [...frames.values()]
      frames.clear()
      for (const callback of pending) callback(now)
    },
    reset() { for (const element of canvases) { element.context.positions.length = 0; element.context.stars.length = 0 } },
    restore() {
      for (const [key, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
    },
  }
}

test('count updates include 0 and 12 without replacing the mounted canvas, even with motion paused', () => {
  const env = environment()
  const scene = new AbyssScene(0)
  try {
    const main = env.mounted[0]!
    for (const count of [6, 0, 1, 12]) {
      env.reset()
      scene.setCount(count)
      assert.equal(main.context.positions.length, count)
      assert.equal(main.context.stars.length, 125)
      assert.deepEqual(env.mounted, [main])
      assert.equal(env.frames.size, 0)
    }
  } finally { scene.dispose(); env.restore() }
})

test('changing intensity and resuming a hidden page keep the current swimming positions', () => {
  const env = environment()
  const scene = new AbyssScene(65, 2)
  try {
    env.step(100)
    env.reset()
    env.step(140)
    const before = [...env.mounted[0]!.context.positions]
    env.reset()
    scene.setIntensity(25)
    assert.deepEqual(env.mounted[0]!.context.positions, before)
    env.doc.hidden = true
    env.visibility()
    assert.equal(env.frames.size, 0)
    env.step(100_000)
    env.doc.hidden = false
    env.reset()
    env.visibility()
    assert.deepEqual(env.mounted[0]!.context.positions, before)
  } finally { scene.dispose(); env.restore() }
})

test('stars keep wrapping inside the viewport after several minutes of animation', () => {
  const env = environment()
  const scene = new AbyssScene(65, 0)
  try {
    for (let frame = 1; frame <= 3_100; frame += 1) { env.reset(); env.step(frame * 100) }
    const stars = env.mounted[0]!.context.stars
    assert.equal(stars.length, 125)
    assert.ok(stars.every(y => y >= 0 && y < 800))
  } finally { scene.dispose(); env.restore() }
})
