import { ErrorStackEntry } from '../db/schema';
import { ErrorStack } from '..';

export class ErrorStackMapper {
    public static mapErrorSatckDBEntryToErrorStack(errorStackEntry: ErrorStackEntry.SchemaMap): ErrorStack {
        return {
            app_version: errorStackEntry[ErrorStackEntry.COLUMN_NAME_APP_VERSION],
            stack_trace: errorStackEntry[ErrorStackEntry.COLUMN_NAME_STACK_TRACE],
            page_id: errorStackEntry[ErrorStackEntry.COLUMN_NAME_PAGE_ID],
            method_name: errorStackEntry[ErrorStackEntry.COLUMN_NAME_METHOD_NAME]
        };
    }

    public static mapErrorStackToErrorStackDBEntry(errorStack: ErrorStack): ErrorStackEntry.SchemaMap {
        return {
            [ErrorStackEntry.COLUMN_NAME_APP_VERSION]: errorStack.app_version,
            [ErrorStackEntry.COLUMN_NAME_STACK_TRACE]: errorStack.stack_trace,
            [ErrorStackEntry.COLUMN_NAME_PAGE_ID]: errorStack.page_id,
            [ErrorStackEntry.COLUMN_NAME_METHOD_NAME]: errorStack.method_name
        };
    }
}
