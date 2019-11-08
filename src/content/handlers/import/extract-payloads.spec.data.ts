import { ContentImportStatus } from './../../util/content-constants';
import { ContentImportResponse } from './../../../../dist/content/def/response.d';
import { ImportContentContext } from './../../def/requests';

const contentImportResponse: ContentImportResponse[] = [{
    identifier: 'SAMPLE_IDENTIFIER',
    status: ContentImportStatus.IMPORT_COMPLETED
}];

export const mockImportContentContext: ImportContentContext = {
    isChildContent: true,
    ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
    tmpLocation: 'SAMPLE_TEMP_LOCATION',
    destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
    contentImportResponseList: contentImportResponse,
    contentIdsToDelete: new Set(['1', '2']),
    items: [
        { identifier: 'IDENTIFIER',
        appIcon: 'http://ntpproductionall.blob.core.windows.net/ntp-content-production/content/do_31257573271802675214122/artifact/maths_9_em_1535123673341.thumb.jpg',
        path: 'file:///storage/emulated/0/Android/data/preprod.diksha.app/files/Download/do_31257573271802675214122.png'
    }
    ],
    existedContentIdentifiers: {'identifier' : true}
};
