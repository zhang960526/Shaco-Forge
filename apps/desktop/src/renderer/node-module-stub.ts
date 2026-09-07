export const createRequire = (): never => {
  throw new Error('node:module is unavailable in the sandboxed Renderer')
}

export type LoadHookContext = never
