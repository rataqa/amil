import { MessageAdapter } from '../../message-adapter';
import { AzureDocIntellService, OfficeParserService } from '../../services';
import { IAmil, IOutput } from '../../types';
import { base64 } from '../../utils/strings';

export class TextExtractorUsingBuffer implements IAmil<Buffer, string> {

  constructor(
    protected op: OfficeParserService | null = null,
    protected ai: AzureDocIntellService | null = null,
  ) {
    if (!op && !ai) throw new Error('office-parser or azure-doc-intell is required');
  }

  async work(msgAdapter: MessageAdapter<Buffer>): Promise<IOutput<string>> {
    const buffer = msgAdapter.bufferPayload();
    const contentBase64 = base64.fromBuffer(buffer);
    const fileName = msgAdapter.fileNameHeader();

    if (!contentBase64) {
      return { success: null, error: new Error('Empty contentBase64') };
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
