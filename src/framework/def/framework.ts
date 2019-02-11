export interface Framework {
    identifier: string;
    code: string;
    name: string;
    description: string;
    type: string;
    objectType: string;
    categories: Array<FrameworkCategories>;
}

export interface FrameworkCategories {
    identifier: string;
    code: string;
    terms: {
        associations: Array<CategoryAssociations>
        identifier: string;
        code: string;
        translations?: null;
        name: string;
        description?: string;
        index: number;
        category: string;
        status: string;
    };
}

export interface CategoryAssociations {
    identifier: string;
    code: string;
    translations?: string;
    name: string;
    description?: string;
    category: string;
    status: string;
}
