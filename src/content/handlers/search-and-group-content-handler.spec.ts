import {SearchAndGroupContentHandler} from './search-and-group-content-handler';
import {ContentService, SearchAndGroupContentRequest} from '..';
import {CachedItemStore} from '../../key-value-store';
import {of} from 'rxjs';
import {ContentsGroupGenerator} from './contents-group-generator';

describe('SearchAndGroupContentHandler', () => {
    let searchAndGroupContentHandler: SearchAndGroupContentHandler;
    const mockContentService: Partial<ContentService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        searchAndGroupContentHandler = new SearchAndGroupContentHandler(
            mockContentService as ContentService,
            mockCachedItemStore as CachedItemStore
        );
    });

    it('should be able to create an instance', () => {
        expect(searchAndGroupContentHandler).toBeTruthy();
    });

    describe('handle()', () => {
        it('should combine online and offline contents', (done) => {
            // arrange
            mockContentService.getContents = jest.fn().mockImplementation(() => of([
                {
                    contentData: {
                        'ownershipType': [
                            'createdBy'
                        ],
                        'copyright': '345 org, Sunbird QA Tenant, SunbirdQA 3',
                        'subject': 'Physical Science',
                        'channel': '0124511394914140160',
                        'downloadUrl': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21280780867130982412259/111-book_1563453262670_do_21280780867130982412259_1.0_spine.ecar',
                        'organisation': [
                            '345 org',
                            'Sunbird QA Tenant',
                            'SunbirdQA 3'
                        ],
                        'language': [
                            'English'
                        ],
                        'variants': {
                            'online': {
                                'ecarUrl': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21280780867130982412259/111-book_1563453262699_do_21280780867130982412259_1.0_online.ecar',
                                'size': 3045
                            },
                            'spine': {
                                'ecarUrl': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_21280780867130982412259/111-book_1563453262670_do_21280780867130982412259_1.0_spine.ecar',
                                'size': 6840
                            }
                        },
                        'mimeType': 'application/vnd.ekstep.content-collection',
                        'objectType': 'Content',
                        'appIcon': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21280780867130982412259/artifact/download_1562667557939.thumb.jpeg',
                        'gradeLevel': [
                            'Class 1'
                        ],
                        'appId': 'staging.diksha.portal',
                        'contentEncoding': 'gzip',
                        'lockKey': '9497b6ba-2a74-41cf-bf72-cdd0d117cde4',
                        'totalCompressedSize': 0,
                        'mimeTypesCount': '{"application/vnd.ekstep.content-collection":1}',
                        'contentType': 'TextBook',
                        'identifier': 'do_21280780867130982412259',
                        'audience': [
                            'Learner'
                        ],
                        'toc_url': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21280780867130982412259/artifact/do_21280780867130982412259_toc.json',
                        'visibility': 'Default',
                        'contentTypesCount': '{"TextBookUnit":1}',
                        'childNodes': [
                            'do_21280780875931648012260'
                        ],
                        'consumerId': 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
                        'mediaType': 'content',
                        'osId': 'org.ekstep.quiz.app',
                        'lastPublishedBy': '00c3affc-6988-4b38-9d61-c7bd23ac6cec',
                        'graph_id': 'domain',
                        'nodeType': 'DATA_NODE',
                        'version': 2,
                        'license': 'CC BY 4.0',
                        'prevState': 'Review',
                        'size': 6840,
                        'lastPublishedOn': '2019-07-18T12:34:22.637+0000',
                        'name': '111 Book',
                        'status': 'Live',
                        'code': 'org.sunbird.l5OJ7O',
                        'description': 'Enter description for TextBook',
                        'medium': 'English',
                        'posterImage': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_212801372633423872165/artifact/download_1562667557939.jpeg',
                        'idealScreenSize': 'normal',
                        'createdOn': '2019-07-18T12:33:26.946+0000',
                        'copyrightYear': 2019,
                        'contentDisposition': 'inline',
                        'lastUpdatedOn': '2019-07-18T12:34:22.457+0000',
                        'SYS_INTERNAL_LAST_UPDATED_ON': '2019-07-18T12:34:22.769+0000',
                        'dialcodeRequired': 'No',
                        'lastStatusChangedOn': '2019-07-18T12:34:22.761+0000',
                        'createdFor': [
                            '0124511394914140160',
                            '01245114878763827244',
                            '01231711180382208027'
                        ],
                        'creator': 'Book Creator',
                        'os': [
                            'All'
                        ],
                        'pkgVersion': 1,
                        'versionKey': '1563453262457',
                        'idealScreenDensity': 'hdpi',
                        's3Key': 'ecar_files/do_21280780867130982412259/111-book_1563453262670_do_21280780867130982412259_1.0_spine.ecar',
                        'depth': 0,
                        'framework': 'ap_k-12_1',
                        'lastSubmittedOn': '2019-07-18T12:33:57.859+0000',
                        'createdBy': '25827334-616f-41fc-bc13-b4a1b0b4d7f5',
                        'leafNodesCount': 0,
                        'compatibilityLevel': 1,
                        'board': 'State (Andhra Pradesh)',
                        'resourceType': 'Book',
                        'node_id': 98321
                    }
                }
            ]));
            mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of({
                contentDataList: [{
                    'ownershipType': [
                        'createdBy'
                    ],
                    'copyright': 'Abhi',
                    'keywords': [
                        'teacher',
                        'Test',
                        'student'
                    ],
                    'year': '2004',
                    'subject': 'English',
                    'downloadUrl': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_2128458593096499201172/ab16_1568098634480_do_2128458593096499201172_1.0_spine.ecar',
                    'channel': '012830253834911744102',
                    'organisation': [
                        'TN2.3'
                    ],
                    'language': [
                        'English'
                    ],
                    'variants': {
                        'online': {
                            'ecarUrl': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_2128458593096499201172/ab16_1568098634730_do_2128458593096499201172_1.0_online.ecar',
                            'size': 7827
                        },
                        'spine': {
                            'ecarUrl': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/ecar_files/do_2128458593096499201172/ab16_1568098634480_do_2128458593096499201172_1.0_spine.ecar',
                            'size': 927997
                        }
                    },
                    'mimeType': 'application/vnd.ekstep.content-collection',
                    'leafNodes': [
                        'do_2126025437863280641611',
                        'do_2126138215303577601484',
                        'do_2128267047888322561514'
                    ],
                    'objectType': 'Content',
                    'appIcon': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2128458593096499201172/artifact/_turtle__1549009838461.thumb.jpg',
                    'gradeLevel': [
                        'Class 1',
                        'Class 6',
                        'Class 7',
                        'Class 8'
                    ],
                    'children': [
                        'do_2126025437863280641611',
                        'do_2128267047888322561514',
                        'do_2126138215303577601484'
                    ],
                    'appId': 'staging.diksha.portal',
                    'contentEncoding': 'gzip',
                    'lockKey': 'ccb9c713-3a2d-4db4-9474-58df071f2133',
                    'totalCompressedSize': 3565898,
                    'mimeTypesCount': '{"video/webm":1,"application/vnd.ekstep.content-collection":1,"application/vnd.ekstep.ecml-archive":2}',
                    'contentCredits': '[{"id":"644da49c-7bef-49d6-8e24-e741d148d652","name":"1.10Creator User","type":"user"}]',
                    'contentType': 'TextBook',
                    'lastUpdatedBy': '019374bc-e6f2-4bf4-be7d-7895c41d760f',
                    'identifier': 'do_2128458593096499201172',
                    'audience': [
                        'Learner'
                    ],
                    'toc_url': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2128458593096499201172/artifact/do_2128458593096499201172_toc.json',
                    'visibility': 'Default',
                    'contentTypesCount': '{"TextBookUnit":1,"Resource":3}',
                    'author': 'Abhinav',
                    'childNodes': [
                        'do_2126025437863280641611',
                        'do_2126138215303577601484',
                        'do_2128458595760619521173',
                        'do_2128267047888322561514'
                    ],
                    'consumerId': 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
                    'mediaType': 'content',
                    'osId': 'org.ekstep.quiz.app',
                    'lastPublishedBy': '8feb8c9d-0628-436b-b12d-8fc775dcf3c9',
                    'graph_id': 'domain',
                    'nodeType': 'DATA_NODE',
                    'version': 2,
                    'license': 'CC BY 4.0',
                    'prevState': 'Review',
                    'qrCodeProcessId': '4f885002-ef00-4f56-84b7-58e29f4ea0f2',
                    'lastPublishedOn': '2019-09-10T06:57:14.392+0000',
                    'size': 927997,
                    'name': 'Ab16',
                    'publisher': 'Ab',
                    'attributions': [
                        'Ab'
                    ],
                    'status': 'Live',
                    'code': 'org.sunbird.PhOPHg',
                    'description': '12345',
                    'medium': 'English',
                    'posterImage': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21268948859484569611537/artifact/_turtle__1549009838461.jpg',
                    'idealScreenSize': 'normal',
                    'createdOn': '2019-09-10T06:47:40.260+0000',
                    'reservedDialcodes': '{"M3X5X1":0,"G4U3F5":1}',
                    'copyrightYear': 2019,
                    'contentDisposition': 'inline',
                    'lastUpdatedOn': '2019-09-10T06:57:14.111+0000',
                    'SYS_INTERNAL_LAST_UPDATED_ON': '2019-09-10T06:57:14.868+0000',
                    'dialcodeRequired': 'No',
                    'lastStatusChangedOn': '2019-09-10T06:57:14.854+0000',
                    'createdFor': [
                        '012830253834911744102'
                    ],
                    'creator': '2.3 Book Creator',
                    'os': [
                        'All'
                    ],
                    'pkgVersion': 1,
                    'versionKey': '1568098634111',
                    'idealScreenDensity': 'hdpi',
                    's3Key': 'ecar_files/do_2128458593096499201172/ab16_1568098634480_do_2128458593096499201172_1.0_spine.ecar',
                    'depth': 0,
                    'framework': 'ap_k-12_13',
                    'lastSubmittedOn': '2019-09-10T06:51:33.229+0000',
                    'createdBy': '019374bc-e6f2-4bf4-be7d-7895c41d760f',
                    'leafNodesCount': 3,
                    'compatibilityLevel': 1,
                    'board': 'State (Andhra Pradesh)',
                    'resourceType': 'Book',
                    'node_id': 521527
                }]
            }));
            const request: SearchAndGroupContentRequest = {
                groupBy: 'subject',
                searchCriteria: {}
            };
            spyOn(ContentsGroupGenerator, 'generate').and.callThrough();

            // act
            searchAndGroupContentHandler.handle(request).subscribe((result) => {
                // assert
                expect(mockContentService.getContents).toHaveBeenCalledWith(expect.objectContaining({
                    contentTypes: [],
                    board: request.searchCriteria.board,
                    medium: request.searchCriteria.medium,
                    grade: request.searchCriteria.grade
                }));
                expect(mockCachedItemStore.getCached).toHaveBeenCalledWith(
                    '368568fa77e1fddcc4f484d200929b55ec4feaac',
                    'search_content_grouped',
                    'ttl_search_content_grouped',
                    expect.anything(),
                    undefined,
                    undefined,
                    expect.anything(),
                );
                expect(ContentsGroupGenerator.generate).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({identifier: 'do_21280780867130982412259'}),
                        expect.objectContaining({identifier: 'do_2128458593096499201172'})
                    ]),
                    expect.anything()
                );
                done();
            });
        });
    });
});
