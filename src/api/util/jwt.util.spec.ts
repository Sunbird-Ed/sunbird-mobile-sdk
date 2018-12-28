import {JWTokenType, JWTUtil} from "./jwt.util";

describe('JWTUtil', function () {
    describe('createJWToken', function () {
        it('should return valid JWT token', function () {
            // assert
            const jwt = JWTUtil.createJWToken('SAMPLE_PAYLOAD', 'SAMPLE_SECRET', JWTokenType.HS256);
            expect(typeof jwt === 'string').toBeTruthy();
        });
    });
});