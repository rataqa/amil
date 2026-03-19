import { randomUUID } from "node:crypto";

export function catchErrMsg(func: Function): string {
  try {
    func();
  } catch (err) {
    if (err instanceof Error) {
      return err.message;
    } else {
      throw new Error('Caught error is not an instance of Error');
    }
  }
  throw new Error('Expected error was not thrown');
}

export function makeMsg(content: Buffer, format = 'json', fileName = '', fileType = '') {
  const correlationId = randomUUID();
  const messageId = randomUUID();
  return {
    content,
    fields: {
      deliveryTag: 123,
      routingKey: 'rk',
      consumerTag: 'ct',
      redelivered: false,
      exchange: '',
    },
    properties: {
      headers: {
        format,
        fileName,
        fileType,
        'x-correlation-id': correlationId,
      },
      contentType: 'buffer',
      contentEncoding: 'utf-8',
      deliveryMode: 'd',
      correlationId,
      priority: 'H',
      replyTo: 'me',
      messageId,
      timestamp: new Date().toISOString(),
      expiration: new Date().toISOString(),
      userId: 'haci',
      appId: 'amil',
      type: '',
      clusterId: 'c1',
    },
  };
}
