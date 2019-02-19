export declare const sample_data: {
    "identifier": string;
    "code": string;
    "name": string;
    "description": string;
    "graph_id": string;
    "nodeType": string;
    "type": string;
    "node_id": number;
    "objectType": string;
    "categories": ({
        "identifier": string;
        "code": string;
        "terms": ({
            "associations": {
                "identifier": string;
                "code": string;
                "translations": null;
                "name": string;
                "description": string;
                "category": string;
                "status": string;
            }[];
            "identifier": string;
            "code": string;
            "translations": null;
            "name": string;
            "description": string;
            "index": number;
            "category": string;
            "status": string;
        } | {
            "associations": {
                "identifier": string;
                "code": string;
                "translations": null;
                "name": string;
                "description": string;
                "category": string;
                "status": string;
            }[];
            "identifier": string;
            "code": string;
            "translations": string;
            "name": string;
            "description": string;
            "index": number;
            "category": string;
            "status": string;
        })[];
        "translations": null;
        "name": string;
        "description": string;
        "index": number;
        "status": string;
    } | {
        "identifier": string;
        "code": string;
        "terms": {
            "identifier": string;
            "code": string;
            "translations": null;
            "name": string;
            "description": string;
            "index": number;
            "category": string;
            "status": string;
        }[];
        "translations": null;
        "name": string;
        "description": string;
        "index": number;
        "status": string;
    })[];
};
