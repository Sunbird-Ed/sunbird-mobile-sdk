export interface PageAssemble {
    name: string;
    id: string;
    sections: Array<PageSections>;
}

export interface PageSections {
    display?: string;
    alt?: string;
    count: number;
    description?: string;
    index: number;
    sectionDataType: string;
    imgUrl?: string;
    resmsgId: string;
    contents?: any;
    searchQuery: string;
    name: string;
    id: string;
    apiId: string;
    group: number;
}
