
export interface ZipService {

    unzip(sourceZip: string, destUrl: string, onProgress?: Function): Promise<number>;
}
