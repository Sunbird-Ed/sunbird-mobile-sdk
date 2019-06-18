import { ErrorStackEntry } from '../db/schema';
import { ErrorStack } from '..';
export declare class ErrorStackMapper {
    static mapErrorSatckDBEntryToErrorStack(errorStackEntry: ErrorStackEntry.SchemaMap): ErrorStack;
    static mapErrorStackToErrorStackDBEntry(errorStack: ErrorStack): ErrorStackEntry.SchemaMap;
}
