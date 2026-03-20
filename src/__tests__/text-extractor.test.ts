import dotenv from 'dotenv';
import { strictEqual as equal } from 'node:assert';
import { describe, it } from 'node:test';

import { TextExtractorUsingBuffer, TextExtractorUsingJson } from '../amil';
import { AzureDocIntellService, OfficeParserService } from '../services';
import { base64 } from '../utils';

import * as F from './fixtures';
import { makeMsg } from './utils';
//import { catchErrMsg } from './utils';

dotenv.config();

const penv = process.env;

describe('Amil workers', () => {

  const op = new OfficeParserService();

  const ai = new AzureDocIntellService(
    penv['DOCUMENT_INTELLIGENCE_ENDPOINT'] || '',
    penv['DOCUMENT_INTELLIGENCE_API_KEY'] || '',
  );

  describe('OfficeParser service', () => {
    it('should extract text from buffer from base64', async () => {
      const result = await op.extractTextFromBuffer(F.file1.buffer, 'hello-world.pdf');
      equal(result.success || '', 'Hello World');
    });

    it('should extract text from buffer from file', async () => {
      const result = await op.extractTextFromBuffer(F.file2.buffer, 'sample.pdf');
      equal((result.success || '').includes('Sample PDF'), true);
    });

    it('should extract text from path', async () => {
      const result = await op.extractTextFromPath(F.file2.filePath);
      equal((result.success || '').includes('Sample PDF'), true);
    });
  });

  describe('Azure AI Doc Intell service', () => {
    it('should extract text from base64', async () => {
      const result = await ai.extractTextFromBase64(F.file1.contentBase64);
      equal(result.success || '', 'Hello World');
    });

    // it does not work
    it.skip('should extract text from buffer', async () => {
      const result = await ai.extractTextFromBuffer(F.file1.buffer, 'hello-world.pdf');
      equal(result.success || '', 'Hello World');
    });
  });

  describe('TextExtractor worker', () => {

    const workerJsonOp = new TextExtractorUsingJson(op, null);
    const workerJsonAi = new TextExtractorUsingJson(null, ai);

    const workerBufferOp = new TextExtractorUsingBuffer(op, null);
    const workerBufferAi = new TextExtractorUsingBuffer(null, ai);

    const payload1Json = JSON.stringify({
      file: { fileName: F.file1.fileName, contentBase64: F.file1.contentBase64 },
    });
    const payload1Buffer = base64.toBuffer(payload1Json);
    const adJson1 = makeMsg(payload1Buffer, 'json');

    const bufferOfFile1 = base64.toBuffer(F.file1.contentBase64);
    const adBuffer1 = makeMsg(bufferOfFile1, 'buffer', F.file1.fileName);

    const payloadJson2 = JSON.stringify({
      file: { fileName: F.file2.fileName, contentBase64: F.file2.contentBase64 },
    });
    const buffer2Json = base64.toBuffer(payloadJson2);
    const adJson2 = makeMsg(buffer2Json, 'json');

    it('TextExtractorUsingJson should throw error with no service', () => {
      try {
        new TextExtractorUsingJson(null, null);
        equal(false, true, 'error must be thrown');
      } catch (err) {
        equal(err instanceof Error, true);
      }
    });

    it('TextExtractorUsingBuffer should throw error with no service', () => {
      try {
        new TextExtractorUsingBuffer(null, null);
        equal(false, true, 'error must be thrown');
      } catch (err) {
        equal(err instanceof Error, true);
      }
    });

    // it does not work yet
    it.skip('JSON - should work with base64 with office-parser', async () => {
      const result = await workerJsonOp.work(adJson1);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });

    // it does not work yet
    it.skip('JSON - should work with base64 with office-parser - case 2', async () => {
      const result = await workerJsonOp.work(adJson2);
      equal((result.success || '').includes('Sample PDF'), true);
    });

    // it does not work yet
    it.skip('JSON - should work with base64 with AI', async () => {
      const result = await workerJsonAi.work(adJson1);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });

    it('Buffer - should work with buffer using office-parser', async () => {
      const result = await workerBufferOp.work(adBuffer1);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });

    it('Buffer - should work with buffer using AI', async () => {
      const result = await workerBufferAi.work(adBuffer1);
      equal(result.success || '', 'Hello World', 'text mismatch');
    });
  });

});
