export type WantedType = "REEL" | "VIDEO" | "IMAGE" | "CAROUSEL";

export interface SearchIntent {
    wantedTags: string[];
    excludedTags: string[];
    minFollowers: number | null;
    maxFollowers: number | null;
    wantedTypes: WantedType[];
    language: string | null;
    brand: string | null;
    maxAdRatio: number | null;
    notes: string | null;
}

export interface MatchResult {
    username: string;
    followersCount: number;
    score: number;
    reasons: string[];
    // Optional: include any extra fields you actually store
    // mediaCount?: number;
    // avgLikes?: number;
    // adRatio?: number;
    // topHashtags?: string[];
}

export type SearchResponse = {
    prompt: string;
    intent: SearchIntent;
    results: MatchResult[];
};

