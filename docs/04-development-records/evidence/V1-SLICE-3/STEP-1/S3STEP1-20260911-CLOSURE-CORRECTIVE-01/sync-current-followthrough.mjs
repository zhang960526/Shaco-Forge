import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '../../../../../..')
for (const name of ['docs/00-governance/SHACO-FORGE-CURRENT-STATE.md', 'docs/03-v1.0-plan/SHACO-FORGE-V1.0-DEVELOPMENT-MAP.md']) {
  const path = resolve(root, name)
  const bytes = await readFile(path)
  let text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  assert.ok(!bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])))
  const newline = text.includes('\r\n') ? '\r\n' : '\n'
  const reference = 'REVIEW-029 returned FAIL with S3S1-IR-001 HIGH / BLOCKING. The bounded corrective is in progress; its latest state is the current checkpoint at the top of this document. Original Executor PASS is historical and does not close or freeze Step1. Step2/Step3, Provider and Signing remain unauthorized.'
  if (name.includes('CURRENT-STATE')) {
    text = text.replace(/(## Current Phase\r?\n)[\s\S]*?(?=<details>)/, `$1${newline}${reference}${newline}${newline}`)
    text = text.replace('Step1 implementation Independent Review is NOT_STARTED.', 'Step1 implementation Independent Review is REVIEW-029 / FAIL; S3S1-IR-001 corrective follows the current checkpoint.')
    text = text.replace(/- V1 Slice 3: IN_PROGRESS; Contract FROZEN_FOR_IMPLEMENTATION; Step1 IMPLEMENTED_WAITING_INDEPENDENT_REVIEW[^\r\n]+/, '- V1 Slice 3: IN_PROGRESS; Contract FROZEN_FOR_IMPLEMENTATION; Step1 REVIEW-029 FAIL / S3S1-IR-001 corrective per current checkpoint; Owner closure NOT_PERFORMED; baseline NOT_FROZEN. Step2/Step3 NOT_AUTHORIZED; F-05 OPEN_KNOWN_CONSTRAINT; Slice4 NOT_STARTED.')
    text = text.replace(/(## Immediate Next Action\r?\n)[\s\S]*?(?=<details>)/, `$1${newline}Follow V1_CURRENT_NEXT_ACTION in the single current checkpoint above. The only authorized work is S3S1-IR-001 corrective implementation and its Executor validation; targeted independent re-review is a subsequent action, not executed by this Executor.${newline}${newline}`)
  } else {
    text = text.replace(/(## Current Implementation Route\r?\n)[\s\S]*?(?=<details>)/, `$1${newline}${reference}${newline}${newline}The Frozen Slice3 Contract still defines the unchanged three-step route. Slice1 and Slice2 remain PASS / CLOSED / FROZEN.${newline}${newline}`)
    text = text.replace('Status: FROZEN_FOR_IMPLEMENTATION / STEP1_IMPLEMENTED_WAITING_INDEPENDENT_REVIEW', 'Status: FROZEN_FOR_IMPLEMENTATION / STEP1_CORRECTIVE_PER_CURRENT_CHECKPOINT')
    text = text.replace('Step1 implementation and required gates passed; Independent Review is NOT_STARTED. Step1 is not closed or frozen. Step2/Step3 and signing execution remain unauthorized.', reference)
  }
  assert.doesNotMatch(text, /\uFFFD|\u953F\u65A4\u62F7|\u00C3|\u00C2/)
  await writeFile(path, text, 'utf8')
}
console.log('Active phase/route/readiness/next-action summaries now follow REVIEW-029 corrective checkpoint; historical evidence untouched.')
