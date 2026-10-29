import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeCount, normalizeIntensity, parsePreferences } from '../src/client/preferences.ts'

test('settings from older versions keep six jellyfish without losing existing choices', () => {
  assert.deepEqual(parsePreferences('{"enabled":true,"intensity":30}'), {
    enabled: true, intensity: 30, count: 6,
  })
})

test('zero jellyfish is a saved choice, not a request for the default', () => {
  assert.deepEqual(parsePreferences('{"enabled":true,"intensity":0,"count":0}'), {
    enabled: true, intensity: 0, count: 0,
  })
})

test('numeric preferences stay within their supported ranges and steps', () => {
  assert.equal(normalizeCount(-3), 0)
  assert.equal(normalizeCount(99), 12)
  assert.equal(normalizeCount(4.7), 5)
  assert.equal(normalizeIntensity(-10), 0)
  assert.equal(normalizeIntensity(150), 100)
  assert.equal(normalizeIntensity(63), 65)
})

test('non-numeric and non-finite preferences fall back to usable defaults', () => {
  for (const value of [undefined, null, '0', {}, NaN, Infinity, -Infinity]) {
    assert.equal(normalizeCount(value), 6)
    assert.equal(normalizeIntensity(value), 65)
  }
  assert.deepEqual(parsePreferences('{"enabled":true,"intensity":"100","count":"12"}'), {
    enabled: true, intensity: 65, count: 6,
  })
})

test('damaged or non-object saved settings disable the effect with safe defaults', () => {
  for (const raw of ['{broken', 'null', 'false', '42', '"enabled"']) {
    assert.deepEqual(parsePreferences(raw), { enabled: false, intensity: 65, count: 6 })
  }
  assert.deepEqual(parsePreferences(null), { enabled: true, intensity: 65, count: 6 })
})

test('a disabled background stays disabled when its count is restored', () => {
  assert.deepEqual(parsePreferences('{"enabled":false,"intensity":80,"count":9}'), {
    enabled: false, intensity: 80, count: 9,
  })
  assert.equal(parsePreferences('{"enabled":"true","count":9}').enabled, false)
})
