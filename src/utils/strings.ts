export const base64 = {
  toBuffer: (b64: string) => Buffer.from(b64, 'base64'),
  fromBuffer: (b: Buffer) => b.toString('base64'),
};

export const buffer = {
  toBase64: (b: Buffer) => b.toString('base64'),
  fromBase64: (b64: string) => Buffer.from(b64, 'base64'),
};
