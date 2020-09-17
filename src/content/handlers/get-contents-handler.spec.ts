import { GetContentsHandler } from './get-contents-handler';
import { ContentRequest, SortOrder, MimeType } from '..';
import { ArrayUtil } from '../../util/array-util';

describe('GetContentsHandler', () => {
    let getContentsHandler: GetContentsHandler;

    beforeAll(() => {
        getContentsHandler = new GetContentsHandler();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance for getContentsHandler', () => {
        expect(getContentsHandler).toBeTruthy();
    });

    describe('getAllLocalContentQuery', () => {
        it('should return recently viewed query for local only', () => {
            // arrange
            const request: ContentRequest = {
                primaryCategories: [],
                uid: 'sample-uid',
                resourcesOnly: true,
                audience: ['sample-audience'],
                exclPragma: ['sample-excl-pragma'],
                pragma: ['pragma1', 'pragma2'],
                sortCriteria: [{
                    sortAttribute: 'sort-attribute',
                    sortOrder: SortOrder.ASC
                }],
                recentlyViewed: true,
                localOnly: true,
                limit: 1
            };
            getContentsHandler.getAllLocalContentQuery(request);
            expect(request.resourcesOnly).toBeTruthy();
            expect(request.recentlyViewed).toBeTruthy();
            expect(MimeType.COLLECTION.valueOf()).toBe('application/vnd.ekstep.content-collection');
        });

        it('should return recently viewed query for else part', () => {
            // arrange
            const request: ContentRequest = {
                primaryCategories: ['pdf', 'ecml'],
                uid: 'uid',
                resourcesOnly: false,
                audience: undefined,
                exclPragma: undefined,
                pragma: ['pragma1', 'pragma2'],
                sortCriteria: undefined,
                recentlyViewed: true,
                localOnly: false,
                limit: 1,
                board: ['cbsc'],
                medium: ['english'],
                grade: ['class 3'],
                dialcodes: ['sample-dial-code'],
                childNodes: ['sample-child-node']
            };
            getContentsHandler.getAllLocalContentQuery(request);
            expect(request.recentlyViewed).toBeTruthy();
            expect(request.resourcesOnly).toBeFalsy();
            expect(request.audience).toBeUndefined();
            expect(request.exclPragma).toBeUndefined();
            expect(request.pragma).not.toBeUndefined();
            expect(MimeType.COLLECTION.valueOf()).toBe('application/vnd.ekstep.content-collection');
        });

        it('should generateSortByQuer for lastUsedOn', () => {
            // arrange
            const request: ContentRequest = {
                primaryCategories: ['pdf', 'ecml'],
                uid: undefined,
                resourcesOnly: false,
                audience: undefined,
                exclPragma: undefined,
                pragma: undefined,
                sortCriteria: [{
                    sortAttribute: 'lastUsedOn',
                    sortOrder: SortOrder.ASC
                }],
                recentlyViewed: true,
                localOnly: false,
                limit: 1,
                board: ['cbsc'],
                medium: ['english'],
                grade: ['class 3'],
                dialcodes: ['sample-dial-code'],
                childNodes: ['sample-child-node']
            };
            getContentsHandler.getAllLocalContentQuery(request);
            expect(request.resourcesOnly).toBeFalsy();
        });

        it('should generateSortByQuer for localLastUpdatedOn', () => {
            // arrange
            const request: ContentRequest = {
                primaryCategories: ['pdf', 'ecml'],
                uid: ['uid-123', 'uid-234'],
                resourcesOnly: false,
                audience: undefined,
                exclPragma: undefined,
                pragma: undefined,
                sortCriteria: [{
                    sortAttribute: 'localLastUpdatedOn',
                    sortOrder: SortOrder.ASC
                }],
                recentlyViewed: false,
                localOnly: false,
                limit: 1,
                board: ['cbsc'],
                medium: ['english'],
                grade: ['class 3'],
                dialcodes: ['sample-dial-code'],
                childNodes: ['sample-child-node']
            };
            getContentsHandler.getAllLocalContentQuery(request);
            expect(request.resourcesOnly).toBeFalsy();
        });

        it('should generateSortByQuer for sizeOnDevice', () => {
            // arrange
            const request: ContentRequest = {
                primaryCategories: ['pdf', 'ecml'],
                uid: 'uid-123',
                resourcesOnly: false,
                audience: undefined,
                exclPragma: undefined,
                pragma: undefined,
                sortCriteria: [{
                    sortAttribute: 'sizeOnDevice',
                    sortOrder: SortOrder.ASC
                }],
                recentlyViewed: false,
                localOnly: false,
                limit: 1,
                board: ['cbsc'],
                medium: ['english'],
                grade: ['class 3'],
                dialcodes: ['sample-dial-code'],
                childNodes: ['sample-child-node']
            };
            getContentsHandler.getAllLocalContentQuery(request);
            expect(request.resourcesOnly).toBeFalsy();
            expect(request.audience).toBeUndefined();
            expect(request.exclPragma).toBeUndefined();
            expect(request.pragma).toBeUndefined();
        });

        it('should generateFieldMatchQuery', () => {
            // arrange
            const request: ContentRequest = {
                primaryCategories: ['pdf', 'ecml'],
                uid: undefined,
                resourcesOnly: false,
                audience: undefined,
                exclPragma: undefined,
                pragma: undefined,
                sortCriteria: [{
                    sortAttribute: 'sizeOnDevice',
                    sortOrder: SortOrder.ASC
                }],
                recentlyViewed: false,
                localOnly: false,
                limit: 1,
                board: ['cbsc', 'assam'],
                medium: ['english', 'hindi'],
                grade: ['class 3', 'class4'],
                dialcodes: ['sample-dial-code', 'dial-code'],
                childNodes: ['sample-child-node', 'child-node']
            };
            getContentsHandler.getAllLocalContentQuery(request);
            expect(request.resourcesOnly).toBeFalsy();
            expect(request.audience).toBeUndefined();
            expect(request.exclPragma).toBeUndefined();
            expect(request.pragma).toBeUndefined();
        });

        it('should invoked generateSortByQuer', () => {
            // arrange
            const request: ContentRequest = {
                primaryCategories: ['pdf', 'ecml'],
                uid: ['uid-123', 'uid-234'],
                resourcesOnly: false,
                audience: ['Teacher', 'Student'],
                exclPragma: ['excelPragma1', 'excelPragma2'],
                pragma: ['pragma1', 'pragma2'],
                sortCriteria: [undefined] as any,
                recentlyViewed: false,
                localOnly: false,
                limit: 1,
                board: ['cbsc'],
                medium: ['english'],
                grade: ['class 3'],
                dialcodes: ['sample-dial-code'],
                childNodes: ['sample-child-node']
            };
            getContentsHandler.getAllLocalContentQuery(request);
            expect(request.resourcesOnly).toBeFalsy();
            expect(request.audience).toBeDefined();
            expect(request.exclPragma).toBeDefined();
            expect(request.pragma).toBeDefined();
        });
    });
});
