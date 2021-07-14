export interface LearnerCertificate {
    _index: string;
    _type: string;
    _id: string;
    _score: number;
    _source: {
        pdfUrl: string;
        data: {
            badge: {
                name: string;
                issuer: {
                    name: string;
                };
            };
            issuedOn: string;
        };
        related: {
            courseId: string;
            Id: string;
        };
    };
}
