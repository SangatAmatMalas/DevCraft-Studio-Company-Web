export type Role = 'super_admin' | 'admin' | 'content_manager' | 'sales';

const CONTENT_ROLES: Role[] = ['super_admin', 'admin', 'content_manager'];
const LEAD_ROLES: Role[] = ['super_admin', 'admin', 'sales'];
const SETTINGS_ROLES: Role[] = ['super_admin', 'admin'];

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
