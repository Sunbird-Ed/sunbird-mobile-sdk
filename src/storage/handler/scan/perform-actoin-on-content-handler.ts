import {ScanContentContext} from '../../def/scan-requests';
import {StorageHandler} from '../storage-handler';
import {ContentUtil} from '../../../content/util/content-util';
import {defer, Observable} from 'rxjs';
import {mapTo} from 'rxjs/operators';

export class PerformActoinOnContentHandler {
    constructor(private storageHandler: StorageHandler) {
    }

    public exexute(context: ScanContentContext): Observable<ScanContentContext> {
        return defer(async () => {
            if (context.deletedIdentifiers!.length) {
                await this.storageHandler.deleteContentsFromDb(context.deletedIdentifiers!);
            }

            if (context.newlyAddedIdentifiers!.length) {
                for (const element of context.newlyAddedIdentifiers!) {
                    await this.storageHandler.addDestinationContentInDb(element,
                        (await ContentUtil.getContentRootDir(context.currentStoragePath)).concat('/'), false);
                }
            }
        }).pipe(
            mapTo(context)
        );
    }
}
