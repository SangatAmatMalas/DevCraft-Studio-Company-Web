import type { FormDataConvertible } from '@inertiajs/core';

export type FormObject = { [key: string]: FormDataConvertible };

export interface Seo {
    title: string;
    description: string | null;
    canonical: string;
    type: string;
    image: string | null;
    siteName: string | null;
    robots: string;
    jsonLd: Record<string, unknown>[];
}

export interface SiteBrand {
    name: string | null;
    tagline: string | null;
    positioning: string | null;
    logo: string | null;
}

export interface Site {
    brand: SiteBrand;
    contact: {
        email: string | null;
        whatsapp: string | null;
        address: string | null;
        hours: string | null;
    };
    social: {
        github: string | null;
        linkedin: string | null;
        instagram: string | null;
        x: string | null;
    };
    conversion: {
        booking_url: string | null;
        booking_label: string | null;
        lead_magnet_url: string | null;
        lead_magnet_title: string | null;
        lead_magnet_description: string | null;
    };
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
}

export interface SharedProps {
    appName: string;
    site: Site;
    whatsapp: { configured: boolean; url: string | null };
    navigation: { services: { title: string; slug: string }[] };
    auth: { user: AuthUser | null };
    flash: {
        success: string | null;
        warning: string | null;
        error: string | null;
        lead_submitted: boolean;
        invitation_url: string | null;
    };
    analytics: { provider: string; measurement_id: string | null };
    [key: string]: unknown;
}

export interface PageMeta {
    current_page: number;
    last_page: number;
    per_page?: number;
    total: number;
    from?: number | null;
    to?: number | null;
}

export interface Paginated<T> {
    data: T[];
    meta: PageMeta;
    links?: { prev: string | null; next: string | null };
}

export interface DesignServiceItem {
    title: string;
    description: string | null;
}

export interface DesignContact {
    whatsapp?: string;
    email?: string;
    city?: string;
}

export interface DesignBriefSummary {
    token: string;
    brand_name: string;
    category_label: string;
    template_label: string | null;
    preview_url: string;
}

export interface DesignBriefContext {
    token: string;
    brand_name: string;
    category_label: string;
    template_label: string | null;
    message_seed: string;
}

export interface DesignBriefEditPayload {
    token: string;
    category: string;
    style: string;
    brand_name: string;
    tagline: string;
    description: string;
    services: { title: string; description: string }[];
    contact: { whatsapp: string; email: string; city: string };
    primary_color: string;
    sections: string[];
    result_url: string;
}

export interface DesignBriefPreview {
    token: string;
    brand_name: string;
    tagline: string | null;
    description: string | null;
    category: string;
    category_label: string;
    style: string;
    primary_color: string;
    sections: string[];
    services: DesignServiceItem[];
    contact: DesignContact;
    chosen: string | null;
}

export interface DesignVariant {
    key: string;
    label: string;
    description: string;
    best_for: string;
    preview_url: string;
    embed_url: string;
}

export interface DesignBriefResult extends Omit<DesignBriefPreview, 'description'> {
    style_label: string;
    variants: DesignVariant[];
    chosen_label: string | null;
    chosen_at: string | null;
    expires_at: string | null;
    edit_url: string | null;
    lead_url: string;
    packages_url: string;
    whatsapp_url: string | null;
}

export interface TechnologyTag {
    name: string;
    slug: string;
}

export interface ProjectCard {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    type: string;
    type_label: string;
    type_description: string;
    status_label: string;
    cover_url: string | null;
    is_featured: boolean;
    categories: TechnologyTag[];
    technologies: TechnologyTag[];
    url: string;
    published_at: string | null;
}

export interface ProjectSectionItem {
    id: number;
    heading: string;
    body: string | null;
    type: string;
    metadata: Record<string, unknown> | null;
}

export interface ProjectMediaItem {
    id: number;
    url: string;
    alt: string;
    caption: string | null;
    is_cover: boolean;
}

export interface ProjectDetail extends ProjectCard {
    description: string | null;
    client_name: string | null;
    role_summary: string | null;
    problem: string | null;
    goals: string[];
    solution: string | null;
    outcome: string | null;
    started_at: string | null;
    completed_at: string | null;
    repository_url: string | null;
    demo_url: string | null;
    sections: ProjectSectionItem[];
    gallery: ProjectMediaItem[];
}

export interface ServiceCard {
    id: number;
    title: string;
    slug: string;
    summary: string;
    icon_name: string | null;
    is_featured: boolean;
    url: string;
}

export interface ProcessStep {
    title: string;
    description?: string | null;
}

export interface ServiceFaq {
    question: string;
    answer: string;
}

export interface ServiceDetail extends ServiceCard {
    description: string | null;
    deliverables: string[];
    process: ProcessStep[];
    faqs: ServiceFaq[];
    technologies: string[];
    cost_factors: string | null;
}

export interface PackageCard {
    id: number;
    name: string;
    slug: string;
    tagline: string | null;
    target_audience: string | null;
    price_display: string;
    price_amount: number | null;
    price_label: string | null;
    currency: string;
    billing_type: string;
    billing_label: string;
    timeline_label: string | null;
    is_featured: boolean;
    has_visible_price: boolean;
    url: string;
}

export interface PackageAddon {
    id: number;
    name: string;
    description: string | null;
    price_label: string | null;
}

export interface PackageDetail extends PackageCard {
    revision_policy: string | null;
    included_items: string[];
    excluded_items: string[];
    limitations: string[];
    addons: PackageAddon[];
}

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    category: string | null;
}

export interface TestimonialItem {
    id: number;
    person_name: string;
    role: string | null;
    organization: string | null;
    quote: string;
    photo_url: string | null;
}

export interface TeamExperienceItem extends FormObject {
    role: string;
    organization: string;
    period: string;
    summary: string;
}

export interface TeamMemberItem {
    id: number;
    name: string;
    role: string;
    bio: string | null;
    photo_url: string | null;
    skills: string[];
    experience: TeamExperienceItem[];
    github_url: string | null;
    linkedin_url: string | null;
}

export interface ContentBlock {
    heading?: string | null;
    body?: string | null;
}

export interface PageContent {
    intro?: string | null;
    blocks?: ContentBlock[];
}

export interface StatusOption {
    [value: string]: string;
}
