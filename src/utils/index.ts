// local utils

export function noOp() {}

export async function fireAndForget(f: Function) {
  try {
    const p = f();
    if (p instanceof Promise) {
      await p;
    }
  } catch (err) {
    // ignore
  }
}

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const base64 = {
  toBuffer: (b64: string) => Buffer.from(b64, 'base64'),
  fromBuffer: (b: Buffer) => b.toString('base64'),
};

export const buffer = {
  toBase64: (b: Buffer) => b.toString('base64'),
  fromBase64: (b64: string) => Buffer.from(b64, 'base64'),
};
