// NOT_PRODUCTION — deterministic business logic; never invoked at module load.
export const SUM3_INPUT = Object.freeze([2, 3, 5]);

export function isSum3Input(values) {
  if (!Array.isArray(values) || Object.getPrototypeOf(values) !== Array.prototype
    || values.length !== 3 || Reflect.ownKeys(values).length !== 4) return false;
  for (let index = 0; index < 3; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(values, String(index));
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, "value")
      || !Number.isSafeInteger(descriptor.value)
      || descriptor.value !== SUM3_INPUT[index]) return false;
  }
  return true;
}

export function executeSum3(values) {
  if (!isSum3Input(values)) {
    throw new TypeError("SUM3_INPUT_MISMATCH");
  }
  // Compute from validated values. The independent oracle lives in src/control.
  return Object.freeze({
    operation: "SUM3",
    count: values.length,
    sum: values.reduce((total, value) => total + value, 0),
  });
}
