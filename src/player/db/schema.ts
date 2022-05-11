import {DbConstants} from '../../db';

export namespace PlayerConfigEntry {
    export const TABLE_NAME = 'player_data';
    export const _ID = '_id';
    export const COLUMN_NAME_USER_ID = 'user_id';
    export const COLUMN_PARENT_IDENTIFIER = 'parent_identifier';
    export const COLUMN_IDENTIFIER = 'identifier';
    export const COLUMN_PLAYER_CONFIG = 'player_config';

    export interface SchemaMap {
        [COLUMN_NAME_USER_ID]: string;
        [COLUMN_PARENT_IDENTIFIER]: string;
        [COLUMN_IDENTIFIER]: string;
        [COLUMN_PLAYER_CONFIG]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' + PlayerConfigEntry._ID +
            ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
            COLUMN_NAME_USER_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_PARENT_IDENTIFIER + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_IDENTIFIER + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_PLAYER_CONFIG + DbConstants.SPACE + DbConstants.TEXT_TYPE + ')';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;
    };

    export const getAlterEntryForPlayerConfig: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_PLAYER_CONFIG} TEXT DEFAULT ''`;
    };
}

export interface PlayerSaveState {
    userId: string;
    parentId: string;
    contentId: string;
    saveState: string;
}

export class PlayerDbEntryMapper {
    public static mapPlayerDbEntryToPlayer(playerEntry: PlayerConfigEntry.SchemaMap): PlayerSaveState {
        return {
            userId: playerEntry[PlayerConfigEntry.COLUMN_NAME_USER_ID],
            parentId: playerEntry[PlayerConfigEntry.COLUMN_PARENT_IDENTIFIER],
            contentId: playerEntry[PlayerConfigEntry.COLUMN_IDENTIFIER],
            saveState: playerEntry[PlayerConfigEntry.COLUMN_PLAYER_CONFIG]
        };
    }

    public static mapPlayerStateToPlayerDbEntry(userId: string, parentId: string,  contentId: string, saveState: string): PlayerConfigEntry.SchemaMap {
        return {
            [PlayerConfigEntry.COLUMN_NAME_USER_ID]: userId,
            [PlayerConfigEntry.COLUMN_PARENT_IDENTIFIER]: parentId,
            [PlayerConfigEntry.COLUMN_IDENTIFIER]: contentId,
            [PlayerConfigEntry.COLUMN_PLAYER_CONFIG]: saveState
        };
    }
}

