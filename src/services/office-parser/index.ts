import officeParser from 'officeparser';
import { IOutput } from '../../types';

//const FILE_EXTENSIONS = ['.doc', '.docx', '.odp', '.ods', '.odt', '.pptx', '.pdf', '.rtf', '.xlsx'];

export class OfficeParserService {

  async extractTextFromBuffer(buffer: Buffer, _fileName = ''): Promise<IOutput<string>> {
    console.debug('OfficeParserService.extractTextFromBuffer()');
    try {
      // if (fileName) {
      //   const fileExt = fileName.toLocaleLowerCase().split('.').pop() || '';
      //   if (!FILE_EXTENSIONS.includes('.' + fileExt)) {
      //     throw new Error(`officeparser: Unsupported file type: ${fileName}`);
      //   }
      // }
      const ast = await officeParser.parseOffice(buffer);
      return { success: ast.toText(), error: null };
    } catch (err) {
      console.debug(err);
      if (err instanceof Error) {
        return { success: null, error: err };
      } else {
        return { success: null, error: new Error('Failed to extract text') };
      };
    }
  }

  async extractTextFromPath(filePath: string): Promise<IOutput<string>> {
    console.debug('OfficeParserService.extractTextFromBuffer()');
    try {
      const ast = await officeParser.parseOffice(filePath);
      return { success: ast.toText(), error: null };
    } catch (err) {
      console.debug(err);
      if (err instanceof Error) {
        return { success: null, error: err };
      } else {
        return { success: null, error: new Error('Failed to extract text') };
      };
    }
  }
}
