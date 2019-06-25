import {DbService} from '../../../db';
import {ScanContentContext} from '../../def/scan-requests';
import {Observable} from 'rxjs';
import {StorageHandler} from '../storage-handler';
import {ContentUtil} from '../../../content/util/content-util';

export class PerformActoinOnContentHandler {
    constructor(private storageHandler: StorageHandler) {
    }

    public exexute(context: ScanContentContext): Observable<ScanContentContext> {
        return Observable.defer(async () => {
            if (context.deletedIdentifiers!.length) {
                await this.storageHandler.deleteContentsFromDb(context.deletedIdentifiers!);
            }

            if (context.newlyAddedIdentifiers!.length) {
                for (const element of context.newlyAddedIdentifiers!) {
                    await this.storageHandler.addDestinationContentInDb(element,
                        ContentUtil.getContentRootDir(context.currentStoragePath).concat('/'), false);
                }
            }
        }).mapTo(context);
    }
}
