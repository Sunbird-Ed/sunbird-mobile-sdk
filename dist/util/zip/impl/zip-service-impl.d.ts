import { ZipService } from '../def/zip-service';
export declare class ZipServiceImpl implements ZipService {
    unzip(sourceZip: string, destUrl: string, onProgress?: Function): Promise<number>;
}
