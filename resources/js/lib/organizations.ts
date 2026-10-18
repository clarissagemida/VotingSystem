export type OrganizationType = 'SSG' | 'FLP' | 'OTHER';

export const positionSets: Record<OrganizationType, string[]> = {
    SSG: [
        'President',
        'Vice President',
        'Senator 1',
        'Senator 2',
        'Senator 3',
        'Senator 4',
        'Senator 5',
        'Senator 6',
        'Senator 7',
        'Senator 8',
        'Senator 9',
        'Senator 10',
    ],

    FLP: [
        'President',
        'Vice President',
        'Secretary',
        'General Secretary',
        'Treasurer',
        'Auditor',
        'Business Manager',
        'Public Relation Officer',
        'Speaker of the House',
        'Deputy Speaker of the House',
        'Sentinel',
        'Muse',
    ],

    OTHER: ['President', 'Vice President', 'Secretary', 'Treasurer', 'Auditor', 'Business Manager', 'PIO', 'Sergeant at Arms', 'Muse', 'Escort'],
};

export const organizationDescriptions: Record<OrganizationType, string> = {
    SSG: 'Supreme Student Government',
    FLP: 'Future Leader of the Philippines',
    OTHER: 'Independent or other recognized organization',
};

export const organizationTypeLabels: Record<OrganizationType, string> = {
    SSG: 'SSG — Supreme Student Government',
    FLP: 'FLP — Future Leader of the Philippines',
    OTHER: 'OTHER — Custom Organization',
};

/**
 * SSG and FLP have fixed names; OTHER keeps the admin-provided name.
 */
export function defaultNameForType(type: OrganizationType): string {
    if (type === 'SSG') {
        return 'Supreme Student Government';
    }

    if (type === 'FLP') {
        return 'Future Leader of the Philippines';
    }

    return '';
}

export function hasFixedName(type: OrganizationType): boolean {
    return type === 'SSG' || type === 'FLP';
}

export function typeBadgeClass(type: OrganizationType): string {
    if (type === 'SSG') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }

    if (type === 'FLP') {
        return 'bg-blue-50 text-blue-700 ring-blue-200';
    }

    return 'bg-purple-50 text-purple-700 ring-purple-200';
}
