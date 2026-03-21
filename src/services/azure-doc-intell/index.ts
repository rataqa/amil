import DocumentIntelligence, { AnalyzeOperationOutput, getLongRunningPoller, isUnexpected } from '@azure-rest/ai-document-intelligence';
import { IOutput } from '../../types';

type IDocumentIntelligence = ReturnType<typeof DocumentIntelligence>;

export class AzureDocIntellService {
  constructor(
    protected endPoint: string = process.env['DOCUMENT_INTELLIGENCE_ENDPOINT'] || '',
    protected apiKey: string = process.env['DOCUMENT_INTELLIGENCE_API_KEY'] || '',
    protected _client: IDocumentIntelligence = DocumentIntelligence(endPoint, { key: apiKey }),
  ) {
    // do nothing
  }

  async _extractText(reqBody: IRequestBody): Promise<IOutput<string>> {
    //console.debug('AzureDocIntellService._extractText()');
    try {
      const path = '/documentModels/{modelId}:analyze';
      const pathParams = 'prebuilt-read';

      const task = await this._client.path(path, pathParams).post(reqBody as any);

      if (isUnexpected(task)) {
        return { success: null, error: new Error(task.body.error.message) };
      }

      const poller = getLongRunningPoller(this._client, task, { intervalInMs: 5_000 });

      const result = await poller.pollUntilDone();

      const output = result.body as AnalyzeOperationOutput;

      if (output.status === 'succeeded') {
        return { success: output.analyzeResult?.content || '', error: null };
      } else {
        return { success: null, error: new Error('Failed to extract text') };
      }

    } catch (err) {

      if (err instanceof Error) {
        return { success: null, error: err };
      } else {
        return { success: null, error: new Error('Failed to extract text') };
      }
    }
  }

  async extractTextFromBase64(base64Source: string, locale = 'en-US'): Promise<IOutput<string>> {
    //console.debug('AzureDocIntellService.extractTextFromBase64()');
    return this._extractText({ body: { base64Source }, queryParameters: { locale }, contentType: 'application/json' });
  }

  async extractTextFromUrl(urlSource: string, locale = 'en-US'): Promise<IOutput<string>> {
    //console.debug('AzureDocIntellService.extractTextFromUrl()');
    return this._extractText({ body: { urlSource }, queryParameters: { locale }, contentType: 'application/json' });
  }

  async extractTextFromBuffer(body: Buffer, locale = 'en-US'): Promise<IOutput<string>> {
    //console.debug('AzureDocIntellService.extractTextFromBuffer()');
    return this._extractText({ body,  queryParameters: { locale }, contentType: 'application/octet-stream' });
  }
}

type IRequestBody = IRequestBodyForBase64 | IRequestBodyForBuffer | IRequestBodyForUrl;

interface IRequestBodyForBase64 {
  contentType: 'application/json',
  body: { base64Source: string; };
  queryParameters: { locale: string; }
}

interface IRequestBodyForBuffer {
  contentType: 'application/octet-stream',
  body: Buffer;
  queryParameters: { locale: string; }
}

interface IRequestBodyForUrl {
  contentType: 'application/json',
  body: { urlSource: string; };
  queryParameters: { locale: string; }
}
