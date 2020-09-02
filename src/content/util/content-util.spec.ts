import {
    ContentEntry
} from '../db/schema';
import { ContentUtil } from './content-util';
import { ContentData, HierarchyInfo, Visibility } from '..';

describe('ContentUtil', () => {
    describe('getExportedFileName()', () => {
        it('should return exported fileName prepending appName', () => {
            // arrange
            const contents: ContentEntry.SchemaMap[] = [
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({
                        name: 'SOME_NAME.......................',
                        pkgVersion: 'SOME_VERSION' }),
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: Visibility.DEFAULT.valueOf(),
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
                },
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({
                        name: 'SOME_NAME.......................',
                        pkgVersion: 'SOME_VERSION' }),
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: Visibility.DEFAULT.valueOf(),
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
                }
            ];

            expect(ContentUtil.getExportedFileName(contents, 'MOCK_APP_NAME'))
                .toEqual('mock_app_name_SOME_NAME.....................-vSOME_VERSION.ecar');
        });

        it('should return exported fileName for name length < 30', () => {
            // arrange
            const contents: ContentEntry.SchemaMap[] = [
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({
                        name: 'SOME_NAME',
                        pkgVersion: 'SOME_VERSION' }),
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
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

    it('should checked dduplicate or not', () => {
        const isDraftContent = true, pkgVersion = 6;
        expect(ContentUtil.isDuplicateCheckRequired(isDraftContent, pkgVersion)).toEqual(false);
    });

    describe('isImportFileExist', () => {
        it('should return true if pkgVersion of local data ig grater', () => {
            const oldContentModel: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'do-123',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {} }',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: 'default',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };
            const contentData = { identifier: 'do-123', visibility: 'default', pkgVersion: 3 };

            expect(ContentUtil.isImportFileExist(oldContentModel, contentData)).toBe(true);
        });

        it('should return false if identifier is not match', () => {
            const oldContentModel: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'do-123',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {} }',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: 'defaults',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };
            const contentData = { identifier: 'do-1234', visibility: 'default', pkgVersion: 3 };

            expect(ContentUtil.isImportFileExist(oldContentModel, contentData)).toBe(false);
        });

        it('should return false if oldContentModel is undefined', () => {
            const oldContentModel = undefined;
            const contentData = undefined;

            expect(ContentUtil.isImportFileExist(oldContentModel, contentData)).toBe(false);
        });
    });

    describe('readAudience', () => {
        it('should return audienceList if audience type is string', () => {
            const contentData = {
                audience: 'sample-audience'
            };

            expect(ContentUtil.readAudience(contentData)).toBe('sample-audience');
        });
    });

    it('should return pragmaList', () => {
        const contentData = {
            pragma: ['sample-params']
        };

        expect(ContentUtil.readPragma(contentData)).toBe('sample-params');
    });

    describe('doesContentExist', () => {
        it('should return true if newPkgVersion is greter', () => {
            const existingContentInDB: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'do-123',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {} }',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: 'default',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };
            const newIdentifier = 'do-123';
            const newPkgVersion = 8;
            const keepLowerVersion = true;

            expect(ContentUtil.doesContentExist(existingContentInDB, newIdentifier, newPkgVersion, keepLowerVersion)).toBe(true);
        });

        it('should return false if newPkgVersion is lesser', () => {
            const existingContentInDB: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'do-123',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {} }',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: 'default',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };
            const newIdentifier = 'do-123';
            const newPkgVersion = 3;
            const keepLowerVersion = true;

            expect(ContentUtil.doesContentExist(existingContentInDB, newIdentifier, newPkgVersion, keepLowerVersion)).toBe(false);
        });

        it('should return false if keepLowerVersion is false', () => {
            const existingContentInDB: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'do-123',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {} }',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: 'default',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };
            const newIdentifier = 'do-123';
            const newPkgVersion = 8;
            const keepLowerVersion = false;

            expect(ContentUtil.doesContentExist(existingContentInDB, newIdentifier, newPkgVersion, keepLowerVersion)).toBe(false);
        });

        it('should return false if oldIdentifier and newIdentifier are not matched', () => {
            const existingContentInDB: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'do-123',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {} }',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: 'default',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };
            const newIdentifier = 'do-1234';
            const newPkgVersion = 3;
            const keepLowerVersion = false;

            expect(ContentUtil.doesContentExist(existingContentInDB, newIdentifier, newPkgVersion, keepLowerVersion)).toBe(false);
        });
    });

    describe('addOrUpdateViralityMetadata', () => {
        it('should invoked ContentUtil.transferCount', () => {
            const localData = {
                contentMetaData: {
                    virality: {
                        origin: 'sample-origin',
                        transferCount: 1
                    }
                },
                virality: {
                    origin: 'sample-origin',
                    transferCount: 1
                }
            };
            const origin = 'sample-origin';

            expect(ContentUtil.addOrUpdateViralityMetadata(localData, origin)).toBeUndefined();
        });

        it('should invoked isContentMetadataPresentWithoutViralityMetadata()', () => {
            const localData = {
                contentMetaData: {
                },
                virality: {
                    origin: 'sample-origin',
                    transferCount: 1
                }
            };
            const origin = 'sample-origin';

            expect(ContentUtil.addOrUpdateViralityMetadata(localData, origin)).toBeUndefined();
        });
    });

    describe('addViralityMetadataIfMissing', () => {
        it('should called for all else part', () => {
            const localData = {
                contentMetaData: {
                    virality: {
                        origin: 'sample-origin',
                        transferCount: 1
                    }
                },
                virality: {
                    origin: 'sample-origin',
                    transferCount: 1
                }
            };
            const origin = 'sample';

            expect(ContentUtil.addViralityMetadataIfMissing(localData, origin)).toBeUndefined();
        });
    });

    it('should return true for contentDisposition', () => {
        const contentData = {
            contentDisposition: 'online'
        };

        expect(ContentUtil.isOnlineContent(contentData)).toEqual(true);
    });

    describe('addOrUpdateDialcodeMapping', () => {
        it('should return dialcodeMapping', () => {
            const jsonStr = '[{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {}, "rootNodes": "sample-root" }]';
            const identifier = 'do-123';
            const rootNodeIdentifier = 'sample-root-node-identifier';

            expect(ContentUtil.addOrUpdateDialcodeMapping(jsonStr, identifier, rootNodeIdentifier)).toBeTruthy();
        });

        it('should return dialcodeMapping for identifier', () => {
            const jsonStr = '{ "name": "SOME_NAME", "pkgVersion": 6, "childNodes": {}, "identifier": "sample-id" }';
            const identifier = 'do-123';
            const rootNodeIdentifier = 'sample-root-node-identifier';

            expect(ContentUtil.addOrUpdateDialcodeMapping(jsonStr, identifier, rootNodeIdentifier)).toBeTruthy();
        });

        it('should return rootNodeIdentifier if jsonStr is undefined', () => {
            const jsonStr = '';
            const identifier = 'do-123';
            const rootNodeIdentifier = 'sample-root-node-identifier';

            expect(ContentUtil.addOrUpdateDialcodeMapping(jsonStr, identifier, rootNodeIdentifier)).toBeTruthy();
        });
    });
});
