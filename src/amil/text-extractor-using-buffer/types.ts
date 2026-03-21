export interface ISuccessWithFileOut {
  file?: IFileOut;
}

export interface IFileOut {
  fileName   : string;
  mimeType   : string;
  contentText: string;
}
