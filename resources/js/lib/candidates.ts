export interface Election {
    id: number;
    title: string;
}

export interface Position {
    id: number;
    position_name: string;
    position_order?: number;
}

export interface Organization {
    id: number;
    name: string;
    positions?: Position[];
}

export interface Candidate {
    id: number;
    partylist_id: number | null;
    candidate_name: string;
    position_name: string;
    photo: string | null;
    platform?: string | null;
    election_id?: number | null;
    organization_id?: number | null;
    election?: Election;
    organization?: Organization;
    created_at?: string;
    updated_at?: string;
}

export interface Partylist {
    id: number;
    partylist_name: string;
    acronym?: string;
    color?: string;
    logo?: string | null;
    election_id?: number;
    organization_id?: number | null;
    election?: Election;
    organization?: Organization;
}

export interface CandidateForm {
    candidate_name: string;
    position_name: string;
    platform: string;
    election_id: string;
    organization_id: string;
    photo: File | null;
}

export const PRIMARY = '#1B4332';

export const EMPTY_CANDIDATE_FORM: CandidateForm = {
    candidate_name: '',
    position_name: '',
    platform: '',
    election_id: '',
    organization_id: '',
    photo: null,
};

export const getCandidatePhotoUrl = (photo: string | null | undefined): string | null => {
    if (!photo) return null;

    const value = String(photo).trim();

    if (!value) return null;

    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
        return value;
    }

    if (value.startsWith('/storage/')) {
        return value;
    }

    if (value.startsWith('storage/')) {
        return `/${value}`;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `/storage/${value}`;
};
