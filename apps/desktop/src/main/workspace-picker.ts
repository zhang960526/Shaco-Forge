export interface PickerDocument {
  window: object
  webContents: object
  frame: object
  documentEpoch: number
  generation: number
}

/** Capture is Main-owned and rejects untrusted windows, subframes and documents. */
export async function pickWorkspaceDirectory(
  capture: () => PickerDocument,
  show: () => Promise<{ canceled: boolean; filePaths: string[] }>,
): Promise<string | null> {
  const before = capture()
  try {
    const result = await show()
    const after = capture()
    if (Object.keys(before).some(key => before[key as keyof PickerDocument] !== after[key as keyof PickerDocument])) {
      throw new Error('NATIVE_PICKER_FAILED')
    }
    if (result.canceled) return null
    if (result.filePaths.length !== 1 || typeof result.filePaths[0] !== 'string' || !result.filePaths[0].trim()) {
      throw new Error('NATIVE_PICKER_FAILED')
    }
    return result.filePaths[0]
  } catch {
    // Never pass native errors (potential paths/options) into Renderer.
    throw new Error('NATIVE_PICKER_FAILED')
  }
}
