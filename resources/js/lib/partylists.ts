export interface Election {
    id: number;
    title: string;
}

export interface Organization {
    id: number;
    name: string;
}

export interface Candidate {
    id: number;
    partylist_id: number | null;
    candidate_name: string;
    position_name?: string;
    photo: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Partylist {
    id: number;

    partylist_name: string;
    acronym: string;

    election_id: number;
    organization_id: number | null;

    color: string;
    description: string | null;

    logo: string | null;
    banner: string | null;

    election?: Election;
    organization?: Organization;

    candidates?: Candidate[];
    candidates_count?: number;
}

export interface PartylistForm {
    partylist_name: string;
    acronym: string;
    election_id: string;
    organization_id: string;
    color: string;
    description: string;
    logo: File | null;
    banner: File | null;
}

export const PRIMARY = '#1B4332';

export const PARTY_COLORS = [
    '#1B4332',
    '#2D6A4F',
    '#40916C',
    '#52B788',
    '#74C69D',

    '#004AAD',
    '#2563EB',
    '#3B82F6',
    '#1D4ED8',
    '#60A5FA',

    '#6A0DAD',
    '#7C3AED',
    '#8B5CF6',
    '#9333EA',
    '#A855F7',

    '#DC2626',
    '#B91C1C',
    '#EF4444',
    '#F87171',
    '#991B1B',

    '#EA580C',
    '#F97316',
    '#FB923C',
    '#C2410C',
    '#9A3412',

    '#CA8A04',
    '#EAB308',
    '#FACC15',
    '#A16207',
    '#854D0E',

    '#0891B2',
    '#06B6D4',
    '#22D3EE',
    '#0E7490',
    '#155E75',

    '#0F766E',
    '#14B8A6',
    '#2DD4BF',
    '#115E59',
    '#134E4A',

    '#DB2777',
    '#EC4899',
    '#F472B6',
    '#BE185D',
    '#9D174D',

    '#475569',
    '#64748B',
    '#94A3B8',
    '#334155',
    '#1E293B',

    '#000000',
    '#374151',
    '#6B7280',
    '#9CA3AF',
    '#FFFFFF',
];

export const EMPTY_FORM: PartylistForm = {
    partylist_name: '',
    acronym: '',
    election_id: '',
    organization_id: '',
    color: PRIMARY,
    description: '',
    logo: null,
    banner: null,
};

export function getPartylistLogoUrl(logo: string | null | undefined): string | null {
    if (!logo) return null;

    const value = String(logo).trim();

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
}
