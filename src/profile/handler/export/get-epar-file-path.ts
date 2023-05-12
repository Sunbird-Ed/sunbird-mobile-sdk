import {Response} from '../../../api';
import {FileService} from '../../../util/file/def/file-service';
import {ExportProfileContext} from '../../def/export-profile-context';
import dayjs from 'dayjs';

export class GetEparFilePath {
    constructor(private fileService: FileService) {
    }

    public execute(exportContext: ExportProfileContext): Promise<Response> {
        const response: Response = new Response();
        const fileName = `profiles_${dayjs().format('YYYYMMDDhhmmss')}.epar`;
        return this.fileService.createDir(exportContext.destinationFolder!.concat('Profile'), false)
            .then((directoryEntry: any) => {
                return this.fileService.createFile(directoryEntry.nativeURL, fileName, true);
            }).then((fileEntry: any) => {
                exportContext.destinationDBFilePath = fileEntry.nativeURL;
                response.body = exportContext;
                return response;
            });
    }
}
