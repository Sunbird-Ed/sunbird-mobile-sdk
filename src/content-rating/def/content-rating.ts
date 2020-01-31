
export interface ContentRatingOptions {
    ContentRatingOptions: {
        1: RatingOption[];
        2: RatingOption[];
        3: RatingOption[];
        4: RatingOption[];
        5: RatingOption[];
    };
}

export interface RatingOption {
    key: string;
    value: string;
    idx: number;
}
