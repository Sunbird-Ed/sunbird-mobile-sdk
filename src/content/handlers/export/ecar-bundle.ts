import {FileService} from '../../../util/file/def/file-service';
import {ZipService} from '../../../util/zip/def/zip-service';
import {ExportContentContext} from '../..';
import {Response} from '../../../api';
import {ContentErrorCode} from '../../util/content-constants';
import {Metadata} from '../../../util/file';

export class EcarBundle {
    private static readonly FILE_SIZE = 'FILE_SIZE';

    constructor(private fileService: FileService,
                private zipService: ZipService) {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        await new Promise<void>((resolve, reject) => {
            this.zipService.zip(exportContentContext.tmpLocationPath!,
                {target: exportContentContext.ecarFilePath!!},
                [],
                [],
                () => {
                    resolve();
                }, () => {
                    response.errorMesg = ContentErrorCode.EXPORT_FAILED_ECAR_BUNDLE;
                    throw response;
                });
        });
        const metaData: Metadata = await this.fileService.getMetaData(exportContentContext.ecarFilePath!);
        exportContentContext.metadata[EcarBundle.FILE_SIZE] = metaData.size;
        response.body = exportContentContext;
        return response;
    }

}
