import dotenv from 'dotenv';
import { strictEqual as equal } from 'node:assert';
import { describe, it } from 'node:test';

import { TextExtractor } from '../amil/text-extractor';
//import { catchErrMsg } from './utils';
import { AzureDocIntellService, OfficeParserService } from '../services';
import { MessageAdapter } from '../message-adapter';
import * as F from './fixtures';
import { makeMsg } from './utils';

dotenv.config();

const penv = process.env;

describe('Amil workers', () => {

  const op = new OfficeParserService();

  const ai = new AzureDocIntellService(
    penv['DOCUMENT_INTELLIGENCE_ENDPOINT'] || '',
    penv['DOCUMENT_INTELLIGENCE_API_KEY'] || '',
  );

  const worker1 = new TextExtractor(op, null);
  const worker2 = new TextExtractor(null, ai);

  const payloadStr1 = JSON.stringify({
    file: {
      fileName: F.file1.fileName,
      contentBase64: F.file1.contentBase64,
    },
  });
  const msgAdapter1 = new MessageAdapter(
    makeMsg(Buffer.from(payloadStr1, 'utf-8'), 'json'),
  );

  const payloadStr2 = F.file1.contentBase64;
  const msgAdapter2 = new MessageAdapter(
    makeMsg(Buffer.from(payloadStr2, 'utf-8'), 'buffer'),
  );

  describe('OfficeParser', () => {
    it('should extract text from buffer 1', async () => {
      const result = await op.extractTextFromBuffer(Buffer.from(payloadStr2, 'utf-8'), 'hello-world.pdf');
      equal(result.success || '', 'Hello World');
    });

    it('should extract text from buffer 2', async () => {
      const result = await op.extractTextFromBuffer(F.file2.buffer, 'sample.pdf');
      equal((result.success || '').includes('Sample PDF'), true);
    });

    it('should extract text from path', async () => {
      //const result = await op.extractTextFromPath(F.file2.filePath);
      const result = await op.extractTextFromPath(F.file2.filePathWindows);
      equal((result.success || '').includes('Sample PDF'), true);
    });
  });

  describe.skip('Azure AI Doc Intell', () => {
    it('should extract text from base64', async () => {
      const result = await ai.extractTextFromBase64(payloadStr2);
      equal(result.success || '', 'Hello World');
    });

    it('should extract text from buffer', async () => {
      const result = await ai.extractTextFromBuffer(Buffer.from(payloadStr2, 'utf-8'), 'hello-world.pdf');
      equal(result.success || '', 'Hello World');
    });
  });

  describe.skip('TextExtractor', () => {
    it('should work with base64 with office-parser', async () => {
      const result = await worker1.work(msgAdapter1);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });

    it('should work with buffer using office-parser', async () => {
      const result = await worker1.work(msgAdapter2);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });

    it('should work with base64 with AI', async () => {
      const result = await worker2.work(msgAdapter1);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });

    it('should work with buffer using AI', async () => {
      const result = await worker2.work(msgAdapter2);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });
  });

});
