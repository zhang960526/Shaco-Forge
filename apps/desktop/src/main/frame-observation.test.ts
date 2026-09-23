import assert from 'node:assert/strict'
import test from 'node:test'
import { encodeJsonFrame, MAX_JSON_FRAME } from '@shaco-forge/contracts'
import { FrameSizeObservation } from './carrier-client.js'

test('frame observation uses exact wire lengths across fragmented/coalesced frames', () => {
  const observer = new FrameSizeObservation()
  const frames = Buffer.concat([encodeJsonFrame({ text: '中文' }), encodeJsonFrame({ text: 'a'.repeat(100) })])
  for (const byte of frames) observer.observe(Buffer.from([byte]))
  assert.equal(observer.maxObservedJsonFrameBytes, Buffer.byteLength(JSON.stringify({ text: 'a'.repeat(100) })))
  assert.equal(observer.oversizeFrames, 0)
})

test('frame observation reports oversize without changing frozen cap or decoder admission', () => {
  const observer = new FrameSizeObservation()
  const prefix = Buffer.alloc(4); prefix.writeUInt32LE(MAX_JSON_FRAME + 1)
  observer.observe(prefix)
  assert.equal(observer.maxObservedJsonFrameBytes, 262145)
  assert.equal(observer.oversizeFrames, 1)
  assert.equal(MAX_JSON_FRAME, 262144)
  assert.throws(() => encodeJsonFrame({ text: 'x'.repeat(MAX_JSON_FRAME) }), /outside/)
})
