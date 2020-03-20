import {ArchivePackageMeta} from '../..';

export interface TelemetryArchivePackageMeta extends ArchivePackageMeta {
    mid: string;
    eventsCount: number;
}
