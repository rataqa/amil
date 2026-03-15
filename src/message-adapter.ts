import amqp from 'amqplib';

import { IMessageAdapter, IMsgPayload, IOutput } from './types';

export class MessageAdapter<TPayload = IMsgPayload> implements IMessageAdapter<TPayload> {
  protected _textPayload = ''; // cache
  protected _jsonPayload: TPayload | null = null; // cache

  constructor(public readonly msg: amqp.ConsumeMessage) {
    // do nothin
  }

  header(key: string): string {
    return this.msg.properties.headers?.[key] || '';
  }

  fileNameHeader() {
    return this.header('fileName');
  }

  fileTypeHeader() {
    return this.header('fileType');
  }

  formatHeader() {
    return this.header('format').toLowerCase() || 'json';
  }

  isJsonFormat(): boolean {
    return this.formatHeader().includes('json');
  }

  isBufferFormat(): boolean {
    return this.formatHeader().includes('buffer');
  }

  correlationIdHeader(): string {
    return this.header('x-correlation-id');
  }

  correlationIdProp(): string {
    return this.msg.properties.correlationId || '';
  }

  bufferPayload(): Buffer {
    return this.msg.content;
  }

  textPayload(): string {
    if (!this._textPayload) {
      this._textPayload = this.msg.content.toString('utf-8');
    }
    return this._textPayload;
  }

  jsonPayload(): IOutput<TPayload> {
    if (!this._jsonPayload) {
      try {
        this._jsonPayload = JSON.parse(this.textPayload()) as TPayload;
      } catch (err) {
        if (err instanceof Error) {
          return { success: null, error: err }
        } else {
          return { success: null, error: new Error('Failed to parse JSON payload') };
        };
      }
    }
    return { success: this._jsonPayload as TPayload, error: null };
  }
}
