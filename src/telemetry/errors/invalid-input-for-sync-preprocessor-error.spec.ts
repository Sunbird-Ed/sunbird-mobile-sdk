import {InvalidInputForSyncPreprocessorError} from './invalid-input-for-sync-preprocessor-error';

describe('InvalidInputForSyncPreprocessorError', () => {
    let invalidInputForSyncPreprocessorError: InvalidInputForSyncPreprocessorError;

    beforeAll(() => {
        invalidInputForSyncPreprocessorError = new InvalidInputForSyncPreprocessorError('sample-message');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of NoCertificateFound', () => {
        expect(invalidInputForSyncPreprocessorError).toBeTruthy();
        expect(invalidInputForSyncPreprocessorError.message).toBe('sample-message');
        expect(invalidInputForSyncPreprocessorError.code).toBe('INVALID_INPUT_FOR_SYNC_PREPROCESSOR');
    });
});
