import { ConsumeMessage } from 'amqplib';

import { AzureDocIntellService, OfficeParserService } from '../../services';
import { IAmil } from '../types';
import { base64 } from '../../utils';
import { IMsgContentWithFile } from './types';
import { IOutput } from '../../types';

export class TextExtractorUsingJson implements IAmil<string> {

  constructor(
    protected op: OfficeParserService | null = null,
    protected ai: AzureDocIntellService | null = null,
  ) {
    if (!op && !ai) throw new Error('office-parser or azure-doc-intell is required');
  }

  async work(msg: ConsumeMessage): Promise<IOutput<string>> {
    let buffer: Buffer;
    const input = JSON.parse(msg.content.toString('utf-8')) as IMsgContentWithFile;
    const contentBase64 = input?.file?.contentBase64 || '';
    const fileName = input?.file?.fileName || '';
    if (!contentBase64) {
      return { success: null, error: new Error('Empty contentBase64') };
    }
    try {
      buffer = base64.toBuffer(contentBase64);
    } catch (err) {
      return { success: null, error: new Error('Invalid contentBase64') };
    }

    let error: Error | null = null;

    if (this.op) {
      const result1 = await this.op.extractTextFromBuffer(buffer, fileName);
      if (result1.success) return { success: result1.success, error: null };
      if (result1.error) error = result1.error;
    }

    if (this.ai) {
      //const result2 = await this.ai.extractTextFromBuffer(buffer); // not working
      const result2 = await this.ai.extractTextFromBase64(contentBase64);
      if (result2.success) return { success: result2.success, error: null };
      if (result2.error) error = result2.error;
    }

    return { success: null, error: error || new Error('office-parser or azure-doc-intell is required') };
  }
}
