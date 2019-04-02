import {DbService} from '../../../db';
import {Response} from '../../../api';
import {DeviceInfo} from '../../../util/device/def/device-info';
import {UniqueId} from '../../../db/util/unique-id';
import {FileService} from '../../../util/file/def/file-service';
import {MetaEntry, TelemetryProcessedEntry} from '../../db/schema';
import {ExportTelemetryContext} from '../..';

export class CreateMetaData {
    constructor(private dbService: DbService,
                private fileService: FileService,
                private deviceInfo: DeviceInfo) {
    }

    public async execute(exportContext: ExportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        const metaData: { [key: string]: any } = await this.generateMetaData();
        return this.dbService.open(exportContext.destinationDBFilePath!).then(() => {
            return this.dbService.execute(MetaEntry.getCreateEntry(), true).toPromise();
        }).then(() => {
            return this.populateMetaData(metaData);
        }).then(() => {
            response.body = exportContext;
            return response;
        }).catch((error) => {
            console.log('error', error);
            throw response;
        });
    }


    private async generateMetaData(): Promise<{ [key: string]: any }> {
        const metaData: { [key: string]: any } = {};
        metaData['version'] = 1;
        metaData['types'] = JSON.stringify(['telemetry']);
        metaData['did'] = this.deviceInfo.getDeviceID();
        metaData['export_id'] = UniqueId.generateUniqueId();
        const query = `SELECT sum(${TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS})  AS count
                       FROM ${TelemetryProcessedEntry.TABLE_NAME}`;
        const result: any[] = await this.dbService.execute(query).toPromise();
        metaData['events_count'] = result[0]['count'];
        return metaData;

    }

    private async populateMetaData(metaData: { [key: string]: any }) {
        Object.keys(metaData).forEach(async (key) => {
            const model = {key: key, value: metaData[key]};
            await this.dbService.insert({
                table: MetaEntry.TABLE_NAME,
                modelJson: model, useExternalDb: true
            }).toPromise();
        });
    }
}
