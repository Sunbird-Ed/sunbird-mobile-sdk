import {TransferContentContext} from '../transfer-content-handler';
import {FileService} from '../../../util/file/def/file-service';
import {defer, Observable} from 'rxjs';

export class ValidateDestinationFolder {
    constructor(private fileService: FileService) {
    }

    execute(context: TransferContentContext): Observable<TransferContentContext> {
        return defer(async () => {
            context.destinationFolder = await this.validate(context.destinationFolder!).then((destination: string) => {
                return this.createDirectory(destination);
            });
            return context;
        });
    }

    private validate(destinationDirectory: string): Promise<string> {
        return this.canWrite(destinationDirectory).then(() => {
            if (!destinationDirectory.endsWith('content/')) {
                destinationDirectory = destinationDirectory.concat('content');
            }
            return destinationDirectory;
        }).catch(() => {
            throw Error('Destination is not writable');
        });
    }

    private createDirectory(directory: string): Promise<string> {
        return this.fileService.exists(directory).then((entry: any) => {
            return entry.nativeURL;
        }).catch(() => {
            return this.fileService.createDir(directory, false).then((directoryEntry: any) => {
                return directoryEntry.nativeURL;
            });
        });
    }

    private async canWrite(directory: string): Promise<undefined> {
        let res;
        return new Promise<undefined>((resolve, reject) => {
            sbutility.canWrite(directory, () => {
                resolve(res);
            }, (e) => {
                reject(e);
            });
        });
    }
}
