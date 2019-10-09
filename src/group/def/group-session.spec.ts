import {UniqueId} from '../../db/util/unique-id';
import { GroupSession } from '..';
import { getServiceIdentifierAsString } from 'inversify';
describe('GroupSession', () => {
    const gid = 'SAMPLE_GID';
    const sid = UniqueId.generateUniqueId();
    const createdTime = Date.now();
    let groupSession: GroupSession;
    beforeAll(() => {
        groupSession = new GroupSession(gid);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of GroupSession', () => {
        expect(groupSession).toBeTruthy();
    });

    it('should get gid', () => {
      expect(groupSession.gid).toBe('SAMPLE_GID');
    });

    it('should get sid', () => {
        // assert
        expect(groupSession.sid).toEqual(expect.any(String));
      });

      it('should get createdTime', () => {
        // assert
        expect(groupSession.createdTime).toEqual(expect.any(Number));
      });
});
