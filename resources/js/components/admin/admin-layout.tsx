import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronDown,
    ClipboardList,
    FolderOpen,
    Gauge,
    History,
    Image as ImageIcon,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareQuote,
    Package,
    PanelLeftClose,
    Settings,
    ShieldCheck,
    Sparkles,
    Tags,
    Users,
    UsersRound,
    Wrench,
    X,
} from 'lucide-react';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';

import FlashToast from '@/components/site/flash-toast';
import Logo from '@/components/site/logo';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { canManageContent, canManageLeads, canManageSettings, canManageUsers } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/types';

type NavItem = {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    match?: (url: string) => boolean;
    visible: (role: string | null) => boolean;
};

type NavGroup = {
    label: string;
    items: NavItem[];
};

const startsWith = (prefix: string) => (url: string) => url === prefix || url.startsWith(`${prefix}/`);

const NAV: NavGroup[] = [
    {
        label: 'Utama',
        items: [
            {
                label: 'Dashboard',
                href: '/admin',
                icon: LayoutDashboard,
                match: (url) => url === '/admin' || url === '/admin/dashboard' || url.startsWith('/admin/dashboard?'),
                visible: () => true,
            },
            {
                label: 'Leads',
                href: '/admin/leads',
                icon: ClipboardList,
                match: startsWith('/admin/leads'),
                visible: canManageLeads,
            },
            {
                label: 'Preview desain',
                href: '/admin/design-briefs',
                icon: Sparkles,
                match: startsWith('/admin/design-briefs'),
                visible: canManageLeads,
            },
            {
                label: 'Template balasan',
                href: '/admin/lead-templates',
                icon: MessageSquareQuote,
                match: startsWith('/admin/lead-templates'),
                visible: canManageLeads,
            },
        ],
    },
    {
        label: 'Konten',
        items: [
            {
                label: 'Portfolio',
                href: '/admin/portfolio',
                icon: FolderOpen,
                match: startsWith('/admin/portfolio'),
                visible: canManageContent,
            },
            {
                label: 'Layanan',
                href: '/admin/services',
                icon: Layers,
                match: startsWith('/admin/services'),
                visible: canManageContent,
            },
            {
                label: 'Paket',
                href: '/admin/packages',
                icon: Package,
                match: startsWith('/admin/packages'),
                visible: canManageContent,
            },
            {
                label: 'FAQ',
                href: '/admin/faqs',
                icon: MessageSquareQuote,
                match: startsWith('/admin/faqs'),
                visible: canManageContent,
            },
            {
                label: 'Testimoni',
                href: '/admin/testimonials',
                icon: Sparkles,
                match: startsWith('/admin/testimonials'),
                visible: canManageContent,
            },
            {
                label: 'Tim',
                href: '/admin/team',
                icon: UsersRound,
                match: startsWith('/admin/team'),
                visible: canManageContent,
            },
            {
                label: 'Halaman',
                href: '/admin/pages',
                icon: BookOpen,
                match: startsWith('/admin/pages'),
                visible: canManageContent,
            },
        ],
    },
    {
        label: 'Taksonomi',
        items: [
            {
                label: 'Kategori',
                href: '/admin/kategori',
                icon: Tags,
                match: startsWith('/admin/kategori'),
                visible: canManageContent,
            },
            {
                label: 'Teknologi',
                href: '/admin/teknologi',
                icon: Wrench,
                match: startsWith('/admin/teknologi'),
                visible: canManageContent,
            },
            {
                label: 'Media',
                href: '/admin/media',
                icon: ImageIcon,
                match: startsWith('/admin/media'),
                visible: canManageContent,
            },
        ],
    },
    {
        label: 'Sistem',
        items: [
            {
                label: 'Pengaturan',
                href: '/admin/settings',
                icon: Settings,
                match: startsWith('/admin/settings'),
                visible: canManageSettings,
            },
            {
                label: 'Activity log',
                href: '/admin/activity-logs',
                icon: History,
                match: startsWith('/admin/activity-logs'),
                visible: canManageSettings,
            },
            {
                label: 'Pengguna',
                href: '/admin/users',
                icon: Users,
                match: startsWith('/admin/users'),
                visible: canManageUsers,
            },
            {
                label: 'Akun saya',
                href: '/admin/akun',
                icon: ShieldCheck,
                match: startsWith('/admin/akun'),
                visible: () => true,
            },
        ],
    },
];

function SidebarContent({ url, role, onNavigate }: { url: string; role: string | null; onNavigate?: () => void }) {
    return (
        <div className="flex h-full flex-col bg-navy text-slate-300">
            <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-5">
                <Logo name="DevCraft Studio" tone="dark" onNavigate={onNavigate} />
                <span className="ml-auto rounded border border-white/15 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400">
                    Admin
                </span>
            </div>

            <nav aria-label="Navigasi admin" className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
                {NAV.map((group) => {
                    const items = group.items.filter((item) => item.visible(role));

                    if (items.length === 0) {
                        return null;
                    }

                    return (
                        <div key={group.label} className="mb-5">
                            <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                {group.label}
                            </p>
                            <ul className="space-y-0.5">
                                {items.map((item) => {
                                    const active = item.match ? item.match(url) : url.startsWith(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onNavigate}
                                                aria-current={active ? 'page' : undefined}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                                    active
                                                        ? 'bg-brand-600 text-white shadow-sm'
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                                                )}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            <div className="shrink-0 border-t border-white/10 p-3">
                <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <Gauge className="h-4 w-4" aria-hidden="true" />
                    Lihat situs
                </Link>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
    title,
    description,
    actions,
    breadcrumbs,
}: {
    children: ReactNode;
    title: string;
    description?: string;
    actions?: ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
}) {
    const { auth } = usePage<SharedProps>().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const user = auth.user;
    const role = user?.role ?? null;

    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    const logout = () => router.post('/logout');

    return (
        <div className="min-h-screen bg-[#f6f8fc]">
            <div className="flex">
                <aside className={cn('sticky top-0 hidden h-screen shrink-0 lg:block', collapsed ? 'w-0 overflow-hidden' : 'w-72')}>
                    <SidebarContent url={url} role={role} />
                </aside>

                <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
                    <DialogTrigger className="hidden" aria-hidden="true" />
                    <DialogContent className="left-0 top-0 h-full max-h-none w-72 max-w-[85vw] translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0">
                        <DialogTitle className="sr-only">Navigasi admin</DialogTitle>
                        <SidebarContent url={url} role={role} onNavigate={() => setMobileOpen(false)} />
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                            aria-label="Tutup menu"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </DialogContent>
                </Dialog>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
                        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                className="grid h-9 w-9 place-items-center rounded-lg border border-border text-navy hover:bg-ice lg:hidden"
                                aria-label="Buka menu navigasi"
                            >
                                <Menu className="h-4 w-4" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setCollapsed((value) => !value)}
                                className="hidden h-9 w-9 place-items-center rounded-lg border border-border text-slate-500 hover:bg-ice lg:grid"
                                aria-label={collapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}
                            >
                                <PanelLeftClose className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} aria-hidden="true" />
                            </button>

                            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                                <Link href="/admin" className="hover:text-brand-700">
                                    Admin
                                </Link>
                                {breadcrumbs?.map((crumb, index) => (
                                    <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                                        <span aria-hidden="true">/</span>
                                        {crumb.href ? (
                                            <Link href={crumb.href} className="truncate hover:text-brand-700">
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className="truncate font-medium text-ink">{crumb.label}</span>
                                        )}
                                    </span>
                                ))}
                            </nav>

                            <div className="ml-auto flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-left transition-colors hover:bg-ice"
                                        >
                                            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                                                {user?.name.charAt(0).toUpperCase() ?? 'A'}
                                            </span>
                                            <span className="hidden min-w-0 sm:block">
                                                <span className="block truncate text-xs font-semibold text-navy">{user?.name}</span>
                                                <span className="block truncate text-[0.65rem] text-muted-foreground">{user?.role_label}</span>
                                            </span>
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                            {user?.email}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/akun">Akun saya</Link>
                                        </DropdownMenuItem>
                                        {canManageSettings(role) ? (
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin/settings">Pengaturan situs</Link>
                                            </DropdownMenuItem>
                                        ) : null}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={logout} className="text-danger focus:text-danger">
                                            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                                            Keluar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mx-auto w-full max-w-6xl">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <h1 className="font-display text-xl font-bold tracking-tight text-navy sm:text-2xl">{title}</h1>
                                    {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
                                </div>
                                {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
                            </div>

                            <div className="mt-6 pb-10">{children}</div>
                        </div>
                    </main>
                </div>
            </div>

            <FlashToast />
        </div>
    );
}
