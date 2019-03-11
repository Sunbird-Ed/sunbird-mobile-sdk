import {FileService} from '../../../util/file/def/file-service';
import {ExportTelemetryContext} from '../..';
import {DeviceInfo} from '../../../util/device/def/device-info';
import {Response} from '../../../api';

export class CreateTelemetryExportFile {
    constructor(private fileService: FileService,
                private deviceInfo: DeviceInfo) {
    }

    public execute(exportContext: ExportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.createDir(exportContext.destinationFolder.concat('Telemetry'), false)
            .then((directoryEntry: DirectoryEntry) => {
                return this.fileService.createFile(directoryEntry.nativeURL, this.getExportedFileName(), true);
            }).then((fileEntry: FileEntry) => {
                exportContext.destinationDBFilePath = fileEntry.nativeURL;
                response.body = exportContext;
                return response;
            });
    }

    private getExportedFileName(): string {
        return `tm_${this.deviceInfo.getDeviceID()}_${Date.now()}.gsa`;
    }
}
