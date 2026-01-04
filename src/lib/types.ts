export type ScoutStatus = "QUEUED" | "RUNNING" | "DONE" | "FAILED";

export type WantedType = "REEL" | "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM" | "CAROUSEL";

export interface SearchIntent {
    wantedTags: string[];
    excludedTags: string[];
    minFollowers: number | null;
    maxFollowers: number | null;
    wantedTypes: string[];
    language: string | null;
    brand: string | null;
    maxAdRatio: number | null;

    recentN?: number;
    preferHighRR?: boolean;
    preferHighRF?: boolean;
    preferLowAd?: boolean;
    requireRegularUpload?: boolean;

    notes: string | null;
}

export interface MatchResult {
    username: string;
    igUserId?: string;
    followersCount: number;
    score: number;
    reasons: string[];
    badges?: string[];
    evidencePostIds?: string[];

}

export interface ScoutSummary {
    id: string;
    status: ScoutStatus;
    prompt: string;
    intent: SearchIntent | null;
    createdAt: string;
    updatedAt: string;
}

export interface ScoutDetail extends ScoutSummary {
    results: MatchResult[];
    errorMessage?: string | null;
}


export interface CreateReportResponse {
    reportId: string;
    scoutId: string;
    createdAt: string;
}

export type InfluencerKpi = {
    rrMed: number | null;
    rfMed: number | null;
    eMed: number | null;
    clMed: number | null;
    adRatio: number | null;
    uploadStdGapDays: number | null;

    rrSeries?: number[]; // recent N (old->new)
    rfSeries?: number[];
    eSeries?: number[];
    clSeries?: number[];
    adSeries?: number[]; // 0/1
    uploadGapSeries?: number[];
};

export type InfluencerAi = {
    headline: string;
    grounds: string[];
    watchouts: string[];
    nextBestAction: string;
};

export type EvidencePost = {
    id: string;
    mediaType: "REEL" | "VIDEO" | "IMAGE" | "CAROUSEL";
    likeCount?: number;
    commentsCount?: number;
    viewCount?: number;
    caption?: string;
    timestamp?: string;
    isAd?: boolean;
};


