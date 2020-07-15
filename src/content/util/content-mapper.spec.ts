import {ContentMapper} from './content-mapper';
import {State} from './content-constants';
import {ContentEntry} from '../db/schema';


describe('ContentMapper', () => {
    describe('mapContentDataToContentDBEntry', () => {
        it('should be return content data for manifestVersion', () => {
            const contentData = {
                lastUpdatedOn: '12/02/20202',
                identifier: 'sample-id',
                mimeType: 'sample-mime-type',
            };
            const manifestVersion = 'sample-manifest-version';

            expect(ContentMapper.mapContentDataToContentDBEntry(contentData, manifestVersion)).toEqual(
                {
                    audience: 'Learner',
                    content_type: undefined,
                    identifier: 'sample-id',
                    local_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type"}',
                    manifest_version: 'sample-manifest-version',
                    mime_type: 'sample-mime-type',
                    pragma: '',
                    server_data: undefined,
                    server_last_updated_on: undefined,
                    visibility: 'Default'
                }
            );
        });

        it('should be return content data if manifestVersion is undefined', () => {
            const contentData = {
                lastUpdatedOn: '12/02/20202',
                identifier: 'sample-id',
                mimeType: 'sample-mime-type',
            };
            const manifestVersion = '';

            expect(ContentMapper.mapContentDataToContentDBEntry(contentData, manifestVersion)).toEqual(
                {
                    audience: 'Learner',
                    content_type: undefined,
                    identifier: 'sample-id',
                    local_data: undefined,
                    manifest_version: '',
                    mime_type: 'sample-mime-type',
                    pragma: '',
                    server_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type"}',
                    server_last_updated_on: '12/02/20202',
                    visibility: 'Default'
                }
            );
        });
    });

    describe('mapContentDBEntryToContent', () => {
        it('should map contentDBEntry to content for localData', () => {
            const contentEntry = {
                identifier: 'sample-identifier',
                server_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type"}',
                local_data: '',
                mime_type: 'sample-mime-type',
                manifest_version: 'sample-manifest-version',
                content_type: 'sample-content-type',
                epoch_timestamp: 5,
                data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type", "visibility": true, "content_state": 3}',
                content_state: State.ARTIFACT_AVAILABLE,
                lastUpdatedOn: '20/02/2020',
                size_on_device: 30,
                path: 'base-path'
            };

            const shouldConvertBasePath = true;
            JSON.parse(contentEntry.data);
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual(
                {
                    basePath: '/_app_file_base-path',
                    contentData: {
                        content_state: 3,
                        identifier: 'sample-id',
                        lastUpdatedOn: '12/02/20202',
                        licenseDetails: undefined,
                        me_averageRating: undefined,
                        me_totalRatingsCount: undefined,
                        mimeType: 'sample-mime-type',
                        previewUrl: undefined,
                        size: undefined,
                        streamingUrl: undefined,
                        visibility: true
                    },
                    contentType: undefined,
                    identifier: 'sample-id',
                    isAvailableLocally: true,
                    isUpdateAvailable: false,
                    lastUpdatedTime: 0,
                    lastUsedTime: 5,
                    mimeType: 'sample-mime-type',
                    referenceCount: 0,
                    sizeOnDevice: 30
                }
            );
        });

        it('should map contentDBEntry to content for localData all properties', () => {
            const contentEntry = {
                identifier: 'sample-identifier',
                server_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type"}',
                local_data: '',
                mime_type: 'sample-mime-type',
                manifest_version: 'sample-manifest-version',
                content_type: 'sample-content-type',
                epoch_timestamp: 5,
                data: '{"size":"10KB","me_averageRating":"3","me_totalRatingsCount": 4, "streamingUrl": "url", "previewUrl": "p-url", "licenseDetails": "license"}',
                content_state: State.ARTIFACT_AVAILABLE,
                lastUpdatedOn: '20/02/2020'
            };

            const shouldConvertBasePath = true;
            JSON.parse(contentEntry.data);
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual(
                {
                    basePath: '/_app_file_',
                    contentData: {
                        licenseDetails: 'license',
                        me_averageRating: '3',
                        me_totalRatingsCount: 4,
                        previewUrl: 'p-url',
                        size: '10KB',
                        streamingUrl: 'url'
                    },
                    contentType: undefined,
                    identifier: undefined,
                    isAvailableLocally: true,
                    isUpdateAvailable: false,
                    lastUpdatedTime: 0,
                    lastUsedTime: 5,
                    mimeType: undefined,
                    referenceCount: 0,
                    sizeOnDevice: NaN
                }
            );
        });

        it('should map contentDBEntry to content for serverData', () => {
            const contentEntry = {
                identifier: 'sample-identifier',
                server_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type"}',
                local_data: '',
                mime_type: 'sample-mime-type',
                manifest_version: 'sample-manifest-version',
                content_type: 'sample-content-type',
                local_last_updated_on: '20/02/2020'
            };

            const shouldConvertBasePath = true;
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual({
                basePath: '/_app_file_',
                contentData: {
                    identifier: 'sample-id',
                    lastUpdatedOn: '12/02/20202',
                    mimeType: 'sample-mime-type'
                },
                contentType: 'sample-content-type',
                identifier: 'sample-identifier',
                isAvailableLocally: false,
                isUpdateAvailable: false,
                lastUpdatedTime: NaN,
                lastUsedTime: 0,
                mimeType: 'sample-mime-type',
                referenceCount: 0,
                sizeOnDevice: NaN
            });
        });

        it('should map contentDBEntry to content for local data', () => {
            const contentEntry = {
                identifier: 'sample-identifier',
                server_data: '',
                local_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type"}',
                mime_type: 'sample-mime-type',
                manifest_version: 'sample-manifest-version',
                content_type: 'sample-content-type',
                local_last_updated_on: '20/02/2020',
                data: 'sample-data'
            };

            const shouldConvertBasePath = true;
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual({
                basePath: '/_app_file_',
                contentData: {
                    identifier: 'sample-id',
                    lastUpdatedOn: '12/02/20202',
                    mimeType: 'sample-mime-type'
                },
                contentType: undefined,
                identifier: 'sample-id',
                isAvailableLocally: false,
                isUpdateAvailable: false,
                lastUpdatedTime: NaN,
                lastUsedTime: 0,
                mimeType: 'sample-mime-type',
                referenceCount: 0,
                sizeOnDevice: 0
            });
        });

        it('should map contentDBEntry to content if server and local data is not available', () => {
            const contentEntry = {
                identifier: 'sample-identifier',
                server_data: '',
                local_data: '{"identifier":"sample-identifier", "name": "some_name", "contentType": "sample-content-type", "mimeType": "sample-mime-type"}',
                mime_type: 'sample-mime-type',
                manifest_version: 'sample-manifest-version',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: 'sample-content-type',
                local_last_updated_on: '20/02/2020',
                data: 'sample-data'
            };

            const shouldConvertBasePath = true;
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual({
                basePath: '/_app_file_',
                contentData: {identifier: 'sample-identifier', name: 'some_name', contentType: 'sample-content-type', mimeType: 'sample-mime-type'},
                contentType: 'sample-content-type',
                identifier: 'sample-identifier',
                name: 'some_name',
                isAvailableLocally: false,
                isUpdateAvailable: false,
                lastUpdatedTime: NaN,
                lastUsedTime: 0,
                mimeType: 'sample-mime-type',
                referenceCount: 0,
                sizeOnDevice: 0
            });
        });
    });

    describe('mapServerResponseToContent', () => {
        it('should maped server response to content', () => {
            const contentData = {
                lastUpdatedOn: '12/02/20202',
                identifier: 'sample-id',
                mimeType: 'sample-mime-type',
            };
            const manifestVersion = 'sample-manifest-version';
            expect(ContentMapper.mapServerResponseToContent(contentData, manifestVersion)).toEqual(
                {
                    basePath: '',
                    contentData: {
                        identifier: 'sample-id',
                        lastUpdatedOn: '12/02/20202',
                        mimeType: 'sample-mime-type'
                    },
                    contentType: undefined,
                    identifier: 'sample-id',
                    isAvailableLocally: false,
                    isUpdateAvailable: false,
                    lastUpdatedTime: 0,
                    lastUsedTime: 0,
                    mimeType: 'sample-mime-type',
                    referenceCount: 0,
                    sizeOnDevice: 0
                }
            );
        });
    });
});
