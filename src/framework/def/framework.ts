export interface Framework {
    name: string;
    identifier: string;
    index?: number;
    code?: string;
    description?: string;
    type?: string;
    objectType?: string;
    categories?: FrameworkCategory[];
}

export interface FrameworkCategory {
    identifier: string;
    code: string;
    terms?: {
        associations: CategoryAssociation[]
        identifier: string;
        code: string;
        translations?: null;
        name: string;
        description?: string;
        index: number;
        category: string;
        status: string;
    }[];
}

export interface CategoryAssociation {
    identifier: string;
    code: string;
    translations?: string;
    name: string;
    description?: string;
    category: string;
    status: string;
}
