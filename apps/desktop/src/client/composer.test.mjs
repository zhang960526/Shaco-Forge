import assert from 'node:assert/strict'
import test from 'node:test'
import {
  collapseLongDraftPaste,
  composeDraftText,
  removeStoredLongDraft,
  restoreLongDraft,
} from './composer.mjs'

const longText = character => character.repeat(1001)

test('prefix followed by a large paste sends the exact native textarea order', () => {
  const prefix = 'PREFIX'
  const pasted = longText('L')
  const stored = collapseLongDraftPaste([], prefix, null, pasted, prefix.length, prefix.length, 1)
  assert.equal(composeDraftText(stored, '', null), prefix + pasted)
})

test('large paste adds no newline, space, or separator and preserves the selected range', () => {
  const pasted = longText('P')
  const stored = collapseLongDraftPaste([], 'LEFT selected RIGHT', null, pasted, 5, 13, 1)
  assert.equal(composeDraftText(stored, '', null), `LEFT ${pasted} RIGHT`)
  assert.notEqual(composeDraftText(stored, '', null), `LEFT \n${pasted} RIGHT`)
})

test('large paste into an empty textarea sends the complete original text', () => {
  const pasted = `first line\n${longText('E')}\nlast line`
  const stored = collapseLongDraftPaste([], '', null, pasted, 0, 0, 1)
  assert.equal(composeDraftText(stored, '', null), pasted)
})

test('expand, restore, delete, and editingLongDraft preserve index semantics', () => {
  const first = { id: 1, text: `FIRST${longText('1')}` }
  const second = { id: 2, text: `SECOND${longText('2')}` }
  const third = { id: 3, text: `THIRD${longText('3')}` }
  const tail = 'TAIL'
  const restored = restoreLongDraft([first, second, third], tail, null, second, 4)

  assert.ok(restored)
  assert.equal(composeDraftText(restored.longDrafts, restored.draft, restored.editingLongDraft), first.text + second.text + third.text + tail)

  const edit = 'EDIT'
  const edited = collapseLongDraftPaste(
    restored.longDrafts,
    restored.draft,
    restored.editingLongDraft,
    edit.repeat(251),
    restored.draft.length,
    restored.draft.length,
    99,
  )
  assert.equal(edited[1].id, second.id)
  assert.equal(composeDraftText(edited, '', null), first.text + second.text + edit.repeat(251) + third.text + tail)

  const removed = removeStoredLongDraft(restored.longDrafts, restored.editingLongDraft, first, 0)
  assert.equal(removed.editingLongDraft.index, 0)
  assert.equal(composeDraftText(removed.longDrafts, restored.draft, removed.editingLongDraft), second.text + third.text + tail)
})

test('composition retains user whitespace around meaningful stored text', () => {
  assert.equal(composeDraftText([{ id: 1, text: 'BODY' }], '\n  ', null), 'BODY\n  ')
  assert.equal(composeDraftText([{ id: 1, text: 'LEFT' }, { id: 2, text: '\n\n' }, { id: 3, text: 'RIGHT' }], '', null), 'LEFT\n\nRIGHT')
})
