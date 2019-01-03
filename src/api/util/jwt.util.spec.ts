import {JWTokenType, JWTUtil} from './jwt.util';

describe('JWTUtil', () => {
    describe('createJWToken', () => {
        it('should return valid JWT token', () => {
            // assert
            const jwt = JWTUtil.createJWToken('SAMPLE_PAYLOAD', 'SAMPLE_SECRET', JWTokenType.HS256);
            expect(typeof jwt === 'string').toBeTruthy();
        });
    });
});