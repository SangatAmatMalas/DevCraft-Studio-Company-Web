export type Role = 'super_admin' | 'admin' | 'content_manager' | 'sales' | 'worker';

const CONTENT_ROLES: Role[] = ['super_admin', 'admin', 'content_manager'];
const LEAD_ROLES: Role[] = ['super_admin', 'admin', 'sales'];
const SETTINGS_ROLES: Role[] = ['super_admin', 'admin'];
const BRIEF_ROLES: Role[] = ['super_admin', 'admin', 'content_manager', 'sales', 'worker'];

export function canManageContent(role?: string | null): boolean {
    return CONTENT_ROLES.includes(role as Role);
}

export function canManageLeads(role?: string | null): boolean {
    return LEAD_ROLES.includes(role as Role);
}

export function canManageSettings(role?: string | null): boolean {
    return SETTINGS_ROLES.includes(role as Role);
}

export function canManageUsers(role?: string | null): boolean {
    return role === 'super_admin';
}

export function canViewDesignBriefs(role?: string | null): boolean {
    return BRIEF_ROLES.includes(role as Role);
}

/** Workers only read design briefs and must never land on the lead dashboard. */
export function isReadOnlyWorker(role?: string | null): boolean {
    return role === 'worker';
}
