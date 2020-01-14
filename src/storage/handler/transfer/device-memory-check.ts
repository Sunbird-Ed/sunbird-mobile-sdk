import {TransferContentContext} from '../transfer-content-handler';
import {DbService} from '../../../db';
import {ContentStorageHandler} from '../../../content/handlers/content-storage-handler';
import {ContentSpaceUsageSummaryResponse} from '../../../content';
import {ContentUtil} from '../../../content/util/content-util';
import {LowMemoryError} from '../../errors/low-memory-error';
import {defer, Observable} from 'rxjs';

export class DeviceMemoryCheck {
    constructor(private dbService: DbService) {
    }

    execute(context: TransferContentContext): Observable<TransferContentContext> {
        return defer(async () => {
            const usableSpace = await this.getFreeUsableSpace(context.destinationFolder!);
            const storageHandler = new ContentStorageHandler(this.dbService);
            const contentStorageResponse: ContentSpaceUsageSummaryResponse[] = await storageHandler.getContentUsageSummary(
                [context.sourceFolder!]);
            let spaceRequired = 0;
            if (contentStorageResponse && contentStorageResponse.length) {
                spaceRequired = contentStorageResponse[0].sizeOnDevice;
            }
            if (!ContentUtil.isFreeSpaceAvailable(usableSpace, spaceRequired, 0)) {
                throw new LowMemoryError('Available memory not sufficient for transfer operation');
            } else {
                return context;
            }

        });
    }

    private async getFreeUsableSpace(directory: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            sbutility.getFreeUsableSpace(directory, (space) => {
                resolve(Number(space));
            }, (e) => {
                reject(e);
            });
        });
    }

}
