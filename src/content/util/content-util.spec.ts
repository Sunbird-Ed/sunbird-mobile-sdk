import {
    ContentEntry
} from '../db/schema';
import { ContentUtil } from './content-util';
import { ContentData, HierarchyInfo } from '..';

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

    describe('isUpdateAvailable', () => {
        it('should be update server data and local data if package version is changed', () => {
            const serverData = {
                pkgVersion: 5
            } as any;
            const localData = {
                pkgVersion: 4
            } as any;

            expect(ContentUtil.isUpdateAvailable(serverData, localData)).toEqual(true);
        });
    });

    describe('getContentRollup', () => {
        it('should content rollup for l1, l2, l3, l4', () => {
            const identifier = 'sample-identifier';
            const hierarchyInfoList: HierarchyInfo[] = [{
                identifier: 'ID-1',
                contentType: 'Type-1'
            }, {
                identifier: 'ID-2',
                contentType: 'Type-2'
            }, {
                identifier: 'ID-3',
                contentType: 'Type-3'
            }, {
                identifier: 'ID-4',
                contentType: 'Type-4'
            }, {
                identifier: 'ID-5',
                contentType: 'Type-5'
            }];

            expect(ContentUtil.getContentRollup(identifier, hierarchyInfoList)).toEqual(
                {
                    l1: 'ID-1',
                    l2: 'ID-2',
                    l3: 'ID-3',
                    l4: 'ID-4'
                }
            );
        });
    });

    describe('getChildContentsIdentifiers', () => {
        it('should return childIdentifiers for localData as string', () => {
            const localData = '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type"}';

            expect(ContentUtil.getChildContentsIdentifiers(localData)).toEqual([]);
        });
    });

    describe('getFirstPartOfThePathNameOnLastDelimiter', () => {
        it('should return last index if / is available', () => {
            const contentFolderName = 'sample/content/folder/name';

            expect(ContentUtil.getFirstPartOfThePathNameOnLastDelimiter(contentFolderName)).toEqual('sample/content/folder');
        });

        it('should return undefiend if / is not available', () => {
            const contentFolderName = '';

            expect(ContentUtil.getFirstPartOfThePathNameOnLastDelimiter(contentFolderName)).toEqual(undefined);
        });
    });

    it('hasPreRequisites', () => {
        const localData = '{"pre_requisites": true}';

        expect(ContentUtil.hasPreRequisites(localData)).toEqual(true);
    });

    it('isDraftContent', () => {
        const status = 'Draft';

        expect(ContentUtil.isDraftContent(status)).toEqual(true);
    });

    describe('isExpired', () => {
        it('for expired', () => {
            const expiryDate = '01/01/2020';

            expect(ContentUtil.isExpired(expiryDate)).toEqual(true);
        });

        it('for not expired', () => {
            const expiryDate = '01/07/2020';

            expect(ContentUtil.isExpired(expiryDate)).toEqual(true);
        });

        it('for undefined expired date', () => {
            const expiryDate = '';

            expect(ContentUtil.isExpired(expiryDate)).toEqual(false);
        });
    });
});
