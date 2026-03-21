import { IObjectWithStrings } from '../../types';

export interface IMsgContentWithHttpIn {
  httpRequest?: IHttpRequest;
}

export interface IHttpRequest {
  method ?: string;
  url     : string;
  body   ?: string;
  headers?: IObjectWithStrings;
}

export interface IMsgContentWithHttpOut {
  httpRequest : IHttpRequest;
  httpResponse: IHttpResponse;
}

export interface IHttpResponse {
  status    : number;
  statusText: string;
  headers   : IObjectWithStrings;
  body      : unknown;
}
