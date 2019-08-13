import {JWTokenType, JWTUtil} from './jwt.util';

describe('JWTUtil', () => {
    describe('createJWToken()', () => {
        it('should return valid JWT token', () => {
            // assert
            const jwt = JWTUtil.createJWToken('SAMPLE_PAYLOAD', 'SAMPLE_SECRET', JWTokenType.HS256);
            expect(typeof jwt === 'string').toBeTruthy();
        });
    });

    describe('getJWTPayload()', () => {
        it('should jwt payload for valid JWT token', () => {
            // assert
            const jwt = JWTUtil.createJWToken({ 'SAMPLE_KEY': 'SAMPLE_VALUE' }, 'SAMPLE_SECRET', JWTokenType.HS256);
            expect(JWTUtil.getJWTPayload(jwt)).toEqual(expect.objectContaining({
                'SAMPLE_KEY': 'SAMPLE_VALUE'
            }));
        });
    });
});
