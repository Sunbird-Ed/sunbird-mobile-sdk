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
                contentType: 'Course'
            };
            const manifestVersion = 'sample-manifest-version';

            expect(ContentMapper.mapContentDataToContentDBEntry(contentData, manifestVersion)).toEqual(
                {
                    audience: 'Learner',
                    content_type: 'course',
                    identifier: 'sample-id',
                    local_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type","contentType":"Course"}',
                    manifest_version: 'sample-manifest-version',
                    mime_type: 'sample-mime-type',
                    pragma: '',
                    server_data: undefined,
                    server_last_updated_on: undefined,
                    visibility: 'Default',
                    primary_category: 'course'
                }
            );
        });

        it('should be return content data if manifestVersion is undefined', () => {
            const contentData = {
                lastUpdatedOn: '12/02/20202',
                identifier: 'sample-id',
                mimeType: 'sample-mime-type',
                contentType: 'resource'
            };
            const manifestVersion = '';

            expect(ContentMapper.mapContentDataToContentDBEntry(contentData, manifestVersion)).toEqual(
                {
                    audience: 'Learner',
                    content_type: 'resource',
                    identifier: 'sample-id',
                    local_data: undefined,
                    manifest_version: '',
                    mime_type: 'sample-mime-type',
                    pragma: '',
                    server_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type","contentType":"resource"}',
                    server_last_updated_on: '12/02/20202',
                    visibility: 'Default',
                    primary_category: 'learning resource'
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
                data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type", "visibility": true, "content_state": 3, "contentType": "textbook"}',
                content_state: State.ARTIFACT_AVAILABLE,
                lastUpdatedOn: '20/02/2020',
                size_on_device: 30,
                path: 'base-path',
                primary_category: 'digital textbook'
            };

            const shouldConvertBasePath = true;
            JSON.parse(contentEntry.data);
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual(
                {
                    basePath: '/_app_file_base-path',
                    contentData: {
                        contentType: 'textbook',
                        content_state: 3,
                        identifier: 'sample-id',
                        lastUpdatedOn: '12/02/20202',
                        mimeType: 'sample-mime-type',
                        primaryCategory: 'Digital Textbook',
                        previewUrl: undefined,
                        size: undefined,
                        streamingUrl: undefined,
                        visibility: true,
                        trackable: {
                            enabled: 'No'
                      }
                    },
                    contentType: 'textbook',
                    identifier: 'sample-id',
                    isAvailableLocally: true,
                    isUpdateAvailable: false,
                    lastUpdatedTime: 0,
                    lastUsedTime: 5,
                    mimeType: 'sample-mime-type',
                    name: undefined,
                    primaryCategory: 'digital textbook',
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
                data: '{"size":"10KB","me_averageRating":"3","me_totalRatingsCount": 4, "streamingUrl": "url", "previewUrl": "p-url", "licenseDetails": "license", "contentType": "Course"}',
                content_state: State.ARTIFACT_AVAILABLE,
                lastUpdatedOn: '20/02/2020',
                primary_category: 'textbook'
            };

            const shouldConvertBasePath = true;
            JSON.parse(contentEntry.data);
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual(
                {
                    basePath: '/_app_file_',
                    contentData: {
                        contentType: 'Course',
                        licenseDetails: 'license',
                        me_averageRating: '3',
                        me_totalRatingsCount: 4,
                        previewUrl: 'p-url',
                        size: '10KB',
                        streamingUrl: 'url',
                        primaryCategory: 'Course',
                        trackable: {
                            enabled: 'Yes'
                        }
                    },
                    contentType: 'course',
                    identifier: undefined,
                    isAvailableLocally: true,
                    isUpdateAvailable: false,
                    lastUpdatedTime: 0,
                    lastUsedTime: 5,
                    mimeType: undefined,
                    name: undefined,
                    primaryCategory: 'course',
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
                local_last_updated_on: '20/02/2020',
                primary_category: 'textbook'
            };

            const shouldConvertBasePath = true;
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual({
                basePath: '/_app_file_',
                contentData: {
                    identifier: 'sample-id',
                    lastUpdatedOn: '12/02/20202',
                    mimeType: 'sample-mime-type',
                    primaryCategory: 'sample-content-type',
                    trackable: {
                        enabled: 'No'
                  }
                },
                contentType: 'sample-content-type',
                identifier: 'sample-identifier',
                isAvailableLocally: false,
                isUpdateAvailable: false,
                lastUpdatedTime: NaN,
                lastUsedTime: 0,
                mimeType: 'sample-mime-type',
                referenceCount: 0,
                sizeOnDevice: NaN,
                name: undefined,
                primaryCategory: 'textbook'
            });
        });

        it('should map contentDBEntry to content for local data', () => {
            const contentEntry = {
                identifier: 'sample-identifier',
                server_data: '',
                local_data: '{"lastUpdatedOn":"12/02/20202","identifier":"sample-id","mimeType":"sample-mime-type","contentType":"Course"}',
                mime_type: 'sample-mime-type',
                manifest_version: 'sample-manifest-version',
                content_type: 'sample-content-type',
                local_last_updated_on: '20/02/2020',
                data: 'sample-data',
                primary_category: 'textbook'
            };

            const shouldConvertBasePath = true;
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual({
                basePath: '/_app_file_',
                contentData: {
                    identifier: 'sample-id',
                    lastUpdatedOn: '12/02/20202',
                    mimeType: 'sample-mime-type',
                    contentType: 'Course',
                    primaryCategory: 'Course',
                    trackable: {
                        enabled: 'Yes'
                    }
                },
                contentType: 'course',
                identifier: 'sample-id',
                isAvailableLocally: false,
                isUpdateAvailable: false,
                lastUpdatedTime: NaN,
                lastUsedTime: 0,
                mimeType: 'sample-mime-type',
                name: undefined,
                primaryCategory: 'course',
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
                data: 'sample-data',
                primary_category: 'textbook'
            };

            const shouldConvertBasePath = true;
            expect(ContentMapper.mapContentDBEntryToContent(contentEntry, shouldConvertBasePath)).toEqual({
                basePath: '/_app_file_',
                contentData: {identifier: 'sample-identifier', name: 'some_name', contentType: 'sample-content-type', mimeType: 'sample-mime-type', primaryCategory: 'sample-content-type', trackable: {
                    enabled: 'No'
                  }},
                contentType: 'sample-content-type',
                identifier: 'sample-identifier',
                name: 'some_name',
                isAvailableLocally: false,
                isUpdateAvailable: false,
                lastUpdatedTime: NaN,
                lastUsedTime: 0,
                mimeType: 'sample-mime-type',
                primaryCategory: 'sample-content-type',
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
                contentType: 'Course'
            };
            const manifestVersion = 'sample-manifest-version';
            expect(ContentMapper.mapServerResponseToContent(contentData, manifestVersion)).toEqual(
                {
                    basePath: '',
                    contentData: {
                        identifier: 'sample-id',
                        lastUpdatedOn: '12/02/20202',
                        mimeType: 'sample-mime-type',
                        contentType: 'Course',
                        primaryCategory: 'Course',
                        trackable: {
                            enabled: 'Yes'
                        }
                    },
                    contentType: 'course',
                    identifier: 'sample-id',
                    isAvailableLocally: false,
                    isUpdateAvailable: false,
                    lastUpdatedTime: 0,
                    lastUsedTime: 0,
                    mimeType: 'sample-mime-type',
                    name: undefined,
                    primaryCategory: 'course',
                    referenceCount: 0,
                    sizeOnDevice: 0
                }
            );
        });
    });
});
