import {DbService} from '../../../db';
import {Response} from '../../../api';
import {DeviceInfo} from '../../../util/device';
import {UniqueId} from '../../../db/util/unique-id';
import {FileService} from '../../../util/file/def/file-service';
import {ExportProfileContext} from '../../def/export-profile-context';
import {MetaEntry} from '../../../telemetry/db/schema';

export class CreateMetaData {
    constructor(private dbService: DbService,
                private fileService: FileService,
                private deviceInfo: DeviceInfo) {
    }

    public async execute(exportContext: ExportProfileContext): Promise<Response> {
        const response: Response = new Response();
        const metaData: { [key: string]: any } = this.generateMetaData(exportContext.userIds, exportContext.groupIds);
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


    private generateMetaData(userIds: string[], groupIds: string[]): { [key: string]: any } {
        const metaData: { [key: string]: any } = {};
        metaData['version'] = 20;
        metaData['types'] = JSON.stringify(['userprofile']);
        metaData['did'] = this.deviceInfo.getDeviceID();
        metaData['export_id'] = UniqueId.generateUniqueId();
        if (!groupIds) {
            groupIds = [];
        }
        metaData['profiles_count'] = userIds.length + groupIds.length;
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
