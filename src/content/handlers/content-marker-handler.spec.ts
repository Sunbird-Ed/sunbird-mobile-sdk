import { ContentMarkerHandler } from './content-marker-handler';
import { DbService } from '../../db';
import { of } from 'rxjs';
import { ContentMarkerEntry } from '../db/schema';

describe('ContentMarkerHandler', () => {
    let contentMarkerHandler: ContentMarkerHandler;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        contentMarkerHandler = new ContentMarkerHandler(
            mockDbService as DbService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be able to create an instance of contentMarkerHandler', () => {
        expect(contentMarkerHandler).toBeTruthy();
    });

    it('should added contentMarker in contain details', (done) => {
        // arrange
        const identifier = 'SAMPLE_IDENTIFIER';
        const uid = 'SAMPLE_UID';
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        // act
        contentMarkerHandler.getContentMarker(identifier, uid).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should return contentMarker in contain details', () => {
        // arrange
        const identifier = 'SAMPLE_IDENTIFIER';
        const uid = 'SAMPLE_UID';
        const request: ContentMarkerEntry.SchemaMap[] = [{
            'uid': 'sample-uid',
            identifier: 'sample-identifier',
            epoch_timestamp: 10,
            data: '',
            extra_info: JSON.stringify({id: 'do-123'}),
            marker: 1,
            mime_type: ''
        }];
        // act
        const data = contentMarkerHandler.mapDBEntriesToContentMarkerDetails(request);
        // assert
        expect(data).toStrictEqual([{
            contentId: 'sample-identifier',
            uid: 'sample-uid',
            extraInfoMap: {id: 'do-123'},
            marker: 1
        }]);
    });
});
