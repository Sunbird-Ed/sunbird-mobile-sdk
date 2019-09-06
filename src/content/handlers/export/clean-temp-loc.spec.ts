import { CleanTempLoc } from "./clean-temp-loc";
import { FileService } from "../../../util/file/def/file-service";
import { ExportContentContext } from "../..";
import { ContentEntry } from "../../db/schema";
import { Observable } from "rxjs";
import {FileUtil} from '../../../util/file/util/file-util';

jest.mock('../../../util/file/util/file-util');

describe('CleanTempLoc', () => {
    let cleanTempLoc: CleanTempLoc;
    const mockFileService: Partial<FileService> = {
        listDir: jest.fn(() => {})
    };

    beforeAll(() => {
        cleanTempLoc = new CleanTempLoc(
            mockFileService as FileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of cleanTempLoc', () => {
        expect(cleanTempLoc).toBeTruthy();
    });

    it('should exportEcar and clean temporary location', async(done) => {
        // arrange
        const request: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"]}',
            mime_type: 'MIME_TYPE',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE'
        }];
        const exportContext: ExportContentContext = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentModelsToExport: request,
            metadata: { ['SAMPLE_KEY']: 'META_DATA' },
        };
        (mockFileService.listDir as jest.Mock).mockReturnValue(['1', '2']);
        // act
        await cleanTempLoc.execute(exportContext).then(() => {
            // assert
          //  expect(mockFileService.listDir).toHaveBeenCalled();
            done();
        });
    });
});
