export interface P8Activation {
  authorizationId: string
  scenarioId: string
  modelDispatchBudget: number
  maxRetries: 0 | 1
}

const FLAG = '--p8-acceptance'
const VALUES = Object.freeze({
  '--p8-authorization-id': 'authorizationId',
  '--p8-scenario-id': 'scenarioId',
  '--p8-model-dispatch-budget': 'modelDispatchBudget',
  '--p8-max-retries': 'maxRetries',
} as const)

const AUDIT_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/
const SCENARIO_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/

export function parseP8ActivationArgs(argv: readonly string[]): P8Activation | undefined {
  const args = argv.filter(value => value.startsWith('--p8-'))
  if (args.length === 0) return undefined

  let enabled = false
  const values: Partial<Record<keyof P8Activation, string>> = {}
  for (const arg of args) {
    if (arg === FLAG) {
      if (enabled) throw new Error('P8_ACTIVATION_DUPLICATE_ARGUMENT: --p8-acceptance')
      enabled = true
      continue
    }
    const separator = arg.indexOf('=')
    const name = separator < 0 ? arg : arg.slice(0, separator)
    if (!(name in VALUES)) throw new Error(`P8_ACTIVATION_UNKNOWN_ARGUMENT: ${name}`)
    if (separator < 0) throw new Error(`P8_ACTIVATION_ARGUMENT_VALUE_REQUIRED: ${name}`)
    const key = VALUES[name as keyof typeof VALUES]
    if (values[key] !== undefined) throw new Error(`P8_ACTIVATION_DUPLICATE_ARGUMENT: ${name}`)
    values[key] = arg.slice(separator + 1)
  }

  if (!enabled || Object.keys(values).length !== Object.keys(VALUES).length) {
    throw new Error('P8_ACTIVATION_PARTIAL_TUPLE')
  }
  if (!AUDIT_ID.test(values.authorizationId ?? '')) throw new Error('P8_ACTIVATION_AUTHORIZATION_ID_INVALID')
  if (!SCENARIO_ID.test(values.scenarioId ?? '')) throw new Error('P8_ACTIVATION_SCENARIO_ID_INVALID')
  if (!/^(0|[1-9][0-9]*)$/.test(values.modelDispatchBudget ?? '')) {
    throw new Error('P8_ACTIVATION_BUDGET_INVALID')
  }
  const modelDispatchBudget = Number(values.modelDispatchBudget)
  if (!Number.isSafeInteger(modelDispatchBudget)) throw new Error('P8_ACTIVATION_BUDGET_INVALID')
  if (values.maxRetries !== '0' && values.maxRetries !== '1') throw new Error('P8_ACTIVATION_MAX_RETRIES_INVALID')

  return Object.freeze({
    authorizationId: values.authorizationId!,
    scenarioId: values.scenarioId!,
    modelDispatchBudget,
    maxRetries: Number(values.maxRetries) as 0 | 1,
  })
}

export function p8ActivationArgs(activation: P8Activation | undefined): string[] {
  if (activation === undefined) return []
  return [
    FLAG,
    `--p8-authorization-id=${activation.authorizationId}`,
    `--p8-scenario-id=${activation.scenarioId}`,
    `--p8-model-dispatch-budget=${activation.modelDispatchBudget}`,
    `--p8-max-retries=${activation.maxRetries}`,
  ]
}

export function sameP8Activation(left: P8Activation | undefined, right: P8Activation | undefined): boolean {
  return left === undefined ? right === undefined : right !== undefined
    && left.authorizationId === right.authorizationId
    && left.scenarioId === right.scenarioId
    && left.modelDispatchBudget === right.modelDispatchBudget
    && left.maxRetries === right.maxRetries
}
