import {UniqueId} from '../../db/util/unique-id';
import {GroupSessionDeprecated} from '..';

describe('GroupSession', () => {
    const gid = 'SAMPLE_GID';
    let groupSession: GroupSessionDeprecated
    jest.spyOn(UniqueId, 'generateUniqueId')
        .mockImplementation(() => 'SECRET')
    beforeAll(() => {
        groupSession = new GroupSessionDeprecated(gid);
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
