import { MessageAdapter } from '../../message-adapter';
import { AzureDocIntellService, OfficeParserService } from '../../services';
import { IAmil, IMsgPayload, IOutput } from '../../types';

export class TextExtractor implements IAmil<IMsgPayload, string> {

  constructor(
    protected op: OfficeParserService | null = null,
    protected ai: AzureDocIntellService | null = null,
  ) {
    // do nothing
  }

  async work(msgAdapter: MessageAdapter): Promise<IOutput<string>> {
    let buffer: Buffer, fileName_ = '';
    if (msgAdapter.isJsonFormat()) {
      const payload = msgAdapter.jsonPayload();
      const { contentBase64 = '', fileName = '' } = payload.success?.file || {};
      fileName_ = fileName;
      if (!contentBase64) {
        return { success: null, error: new Error('Empty contentBase64') };
      }
      try {
        buffer = Buffer.from(contentBase64, 'base64');
      } catch (err) {
        return { success: null, error: new Error('Invalid contentBase64') };
      }
    } else {
      buffer = msgAdapter.bufferPayload();
    }

    let error: Error | null = null;

    if (this.op) {
      const result1 = await this.op.extractTextFromBuffer(buffer, fileName_);
      if (result1.success) return { success: result1.success, error: null };
      if (result1.error) error = result1.error;
    }

    if (this.ai) {
      const result2 = await this.ai.extractTextFromBuffer(buffer);
      if (result2.success) return { success: result2.success, error: null };
      if (result2.error) error = result2.error;
    }

    return { success: null, error: error || new Error('office-parser or azure ai doc intell is required') };
  }
}
