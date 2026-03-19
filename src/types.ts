import amqp from 'amqplib';

export interface IAmil<TPayload = IMsgPayload, TSuccess = any>  {
  work(msgAdapter: IMessageAdapter<TPayload>): Promise<IOutput<TSuccess>>;
  stop?: () => Promise<void>;
}

// alias
export type IWorker<TPayload = IMsgPayload, TSuccess = any> = IAmil<TPayload, TSuccess>;

export type IObjectWithStrings = Record<string, string>;

export interface IMessageAdapter<TPayload = any> {
  msg                  : amqp.ConsumeMessage;
  correlationIdHeader(): string;
  correlationIdProp()  : string;
  header(key: string)  : string;
  formatHeader()       : string;
  isJsonFormat()       : boolean;
  isBufferFormat()     : boolean;
  bufferPayload()      : Buffer;
  textPayload()        : string;
  jsonPayload()        : IOutput<TPayload>;
}

export interface IOutput<TSuccess = any> {
  success?: TSuccess | null;
  error?: Error | null;
}

export interface IMsgPayload {
  file        ?: IMsgFile;
  httpCallback?: IMsgHttpCallback;
  amqpCallback?: IMsgAmqpCallback;
}

export interface IMsgHttpCallback {
  method?: 'POST';
  url    : string;
  headers: IObjectWithStrings;
}

export interface IMsgAmqpCallback {
  queue  : string;
  headers: IObjectWithStrings;
}

export interface IMsgFile {
  fileName     : string;
  fileType     : string;
  contentBase64: string;
}
