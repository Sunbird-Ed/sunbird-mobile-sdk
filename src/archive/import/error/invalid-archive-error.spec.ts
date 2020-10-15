import {InvalidArchiveError} from './invalid-archive-error';

describe('InvalidArchiveError', () => {
    let invalidArchiveError: InvalidArchiveError;

    beforeAll(() => {
        invalidArchiveError = new InvalidArchiveError('sample-message');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of NoCertificateFound', () => {
        expect(invalidArchiveError).toBeTruthy();
        expect(invalidArchiveError.message).toBe('sample-message');
        expect(invalidArchiveError.code).toBe('ASSERTION_ERROR_INVALID_ARCHIVE');
    });
});
