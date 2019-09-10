import { ContentMarkerHandler } from './content-marker-handler';
import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { DbService } from '../../db';
import { Observable } from 'rxjs';

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

    it('should added contentMarker in contain details', () => {
        // arrange
        const identifier = 'SAMPLE_IDENTIFIER';
        const uid = 'SAMPLE_UID';
        mockDbService.execute = jest.fn(() => Observable.of([]));
        // act
        contentMarkerHandler.getContentMarker(identifier, uid).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
        });
    });
});
