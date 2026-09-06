// NOT_PRODUCTION — bounded LF framing; no stream is opened on import.
import { reject } from "../control/phase-a-policy.mjs";
import { MAX_FRAME_BYTES, validateMessage } from "./protocol.mjs";

function appendBytes(left, right) {
  const combined = new Uint8Array(left.byteLength + right.byteLength);
  combined.set(left, 0);
  combined.set(right, left.byteLength);
  return combined;
}

export function createFrameDecoder({ onMessage } = {}) {
  if (typeof onMessage !== "function") reject("FRAME_HANDLER_MISSING", "FRAME_DECODER");
  const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  let buffered = new Uint8Array(0);
  let failed = false;

  return Object.freeze({
    push(chunk) {
      if (failed) reject("FRAME_DECODER_FAILED", "FRAME_DECODER");
      if (!(chunk instanceof Uint8Array) || chunk.byteLength === 0) {
        reject("FRAME_CHUNK_INVALID", "FRAME_DECODER");
      }
      buffered = appendBytes(buffered, chunk);
      while (true) {
        const newline = buffered.indexOf(0x0a);
        if (newline < 0) {
          if (buffered.byteLength >= MAX_FRAME_BYTES) {
            failed = true;
            reject("FRAME_LIMIT", "FRAME_DECODER");
          }
          return;
        }
        const frameBytes = newline + 1;
        if (frameBytes > MAX_FRAME_BYTES || newline === 0
          || buffered[newline - 1] === 0x0d) {
          failed = true;
          reject("FRAME_LIMIT_OR_DELIMITER", "FRAME_DECODER");
        }
        const payload = buffered.slice(0, newline);
        buffered = buffered.slice(frameBytes);
        let value;
        try {
          const text = decoder.decode(payload);
          value = JSON.parse(text);
        } catch {
          failed = true;
          reject("MESSAGE_REJECTED", "FRAME_DECODE");
        }
        onMessage(validateMessage(value));
      }
    },

    end() {
      if (buffered.byteLength !== 0) {
        failed = true;
        reject("TRUNCATED_FRAME", "FRAME_DECODER");
      }
    },
  });
}
