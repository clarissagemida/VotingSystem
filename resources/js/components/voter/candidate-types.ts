export interface Partylist {
    id?: number;
    partylist_name: string;
    acronym: string;
    color: string;
    description: string | null;
}

export interface Candidate {
    id: number;
    candidate_name: string;
    position_name: string;
    candidate_type: string;
    photo: string | null;
    platform?: string | null;
    partylist?: Partylist | null;
    organization?: { organization_name: string } | null;
}

export interface ElectionSummary {
    id: number;
    title: string;
    description: string | null;
    start_at: string | null;
    end_at: string | null;
    status: string;
    has_voted?: boolean;
}
