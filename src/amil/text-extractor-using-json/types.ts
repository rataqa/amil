export interface IMsgContentWithFile {
  file?: IFile;
}

export interface IFile {
  fileName     : string;
  mimeType     : string;
  contentBase64: string;
}
