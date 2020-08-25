import {ValidationError} from './validation-error';

describe('ValidationError', () => {
    let validationError: ValidationError;

    beforeAll(() => {
        validationError = new ValidationError('sample-message');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of NoCertificateFound', () => {
        expect(validationError).toBeTruthy();
        expect(validationError.message).toBe('sample-message');
        expect(validationError.code).toBe('VALIDATION_ERROR');
    });
});
