/* NOT_PRODUCTION: deterministic projection UI and explicit action surface. */

const projection = document.querySelector('#projection')
const approval = document.querySelector('#approval')
const question = document.querySelector('#question')
const answer = document.querySelector('#answer')
let current = null

globalThis.p0s5Bridge.onProjection(value => {
  current = value
  projection.textContent = JSON.stringify(value)
  approval.hidden = value?.pendingKind !== 'approval'
  question.hidden = value?.pendingKind !== 'question'
})
document.querySelector('#approve').addEventListener('click', () => {
  void globalThis.p0s5Bridge.submit({
    action: 'approval-result',
    eventId: current?.eventId,
    value: 'allowed-once',
  })
})

document.querySelector('#answer-submit').addEventListener('click', () => {
  void globalThis.p0s5Bridge.submit({
    action: 'question-answer',
    eventId: current?.eventId,
    value: { answers: [{ id: 'p0s5-choice', selected: [answer.value] }] },
  })
})

globalThis.p0s5Automation = Object.freeze({
  rendererSnapshot() {
    return {
      requireType: typeof globalThis.require,
      processType: typeof globalThis.process,
      bridgeKeys: Object.keys(globalThis.p0s5Bridge ?? {}).sort(),
      directNamedPipeAccess: '__DSH_TRANSPORT__' in globalThis,
      draftStorageKeys: Object.keys(localStorage),
      preload: globalThis.p0s5Bridge.snapshot(),
    }
  },
  clickApproval() {
    document.querySelector('#approve').click()
  },
  submitQuestion(value) {
    answer.value = value
    document.querySelector('#answer-submit').click()
  },
})
