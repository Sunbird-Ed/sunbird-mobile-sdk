import {
    ContentEntry
} from '../db/schema';
import {ContentUtil} from './content-util';

describe('ContentUtil', () => {
    describe('getExportedFileName()', () => {
        it('should return exported fileName prepending appName', () => {
            // arrange
            const contents: ContentEntry.SchemaMap[] = [
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({ name: 'SOME_NAME', pkgVersion: 'SOME_VERSION' }),
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: ''
                }
            ];

            expect(ContentUtil.getExportedFileName(contents, 'MOCK_APP_NAME'))
                .toEqual('mock_app_name_SOME_NAME-vSOME_VERSION.ecar');
        });
    });
});
