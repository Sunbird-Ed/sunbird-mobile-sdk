import {DbService} from '../../../db';
import {ExportContentContext} from '../..';
import {Response} from '../../../api';
import dayjs from 'dayjs';
import {ImportNExportHandler} from '../import-n-export-handler';

export class CreateContentExportManifest {

    private static readonly EKSTEP_CONTENT_ARCHIVE = 'ekstep.content.archive';
    private static readonly SUPPORTED_MANIFEST_VERSION = '1.1';

    constructor(private dbService: DbService,
                private exportHandler: ImportNExportHandler) {
    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        const items: any[] = this.exportHandler.populateItems(exportContentContext.contentModelsToExport);
        exportContentContext.items! = [];
        exportContentContext.manifest = {};
        exportContentContext.items = exportContentContext.items!.concat(items);
        const archive: { [key: string]: any } = {};
        archive['ttl'] = 24;
        archive['count'] = exportContentContext.items!.length;
        archive['items'] = exportContentContext.items;

        // Initialize manifest
        exportContentContext.manifest['id'] = CreateContentExportManifest.EKSTEP_CONTENT_ARCHIVE;
        exportContentContext.manifest['ver'] = CreateContentExportManifest.SUPPORTED_MANIFEST_VERSION;
        exportContentContext.manifest['ts'] = dayjs().format();
        exportContentContext.manifest['archive'] = archive;
        response.body = exportContentContext;
        return Promise.resolve(response);
    }

}
