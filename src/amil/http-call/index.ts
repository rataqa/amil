import { ConsumeMessage } from 'amqplib';

import { IAmil } from '../types';
import { IObjectWithStrings, IOutput } from '../../types';
import { IMsgContentWithHttpIn, IMsgContentWithHttpOut } from './types';

export class HttpCaller implements IAmil<IMsgContentWithHttpOut> {

  async work(msg: ConsumeMessage): Promise<IOutput<IMsgContentWithHttpOut>> {
    const { httpRequest } = JSON.parse(msg.content.toString('utf-8')) as IMsgContentWithHttpIn;
    if (!httpRequest) {
      return { success: null, error: new Error('Missing HTTP details') };
    }

    let error: Error | null = null;

    try {
      const res = await fetch(httpRequest.url, {
        method: httpRequest.method || 'post',
        headers: httpRequest.headers || { ['content-type']: 'application/json' },
        body: httpRequest.body || '{}',
      });
      const headers: IObjectWithStrings = {};
      res.headers.forEach((val, key) => { headers[key] = val; });
      const httpResponse = {
        status    : res.status,
        statusText: res.statusText,
        headers,
        body: await res.json(),
      };
      if (res.status >= 400) {
        throw new Error('HTTP call failed: [' + res.status + ']: '  + res.statusText);
      }
      return {
        success: {
          httpRequest,
          httpResponse,
        },
      };
    } catch (err) {
      error = err instanceof Error ? err : new Error('HTTP call failed: ' + String(err));
    }

    return { success: null, error: error || new Error('HTTP call failed') };
  }
}
