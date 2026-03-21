export interface IMsgContentWithFileIn {
  file?: IFileIn;
}

export interface IFileIn {
  fileName     : string;
  mimeType     : string;
  contentBase64: string;
}

export interface ISuccessWithFileOut {
  file?: IFileOut;
}

export interface IFileOut {
  fileName   : string;
  mimeType   : string;
  contentText: string;
}
