import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BarChart3,
    FolderOpen,
    Inbox,
    Layers,
    MessageSquare,
    Package,
    Plus,
    TrendingUp,
} from 'lucide-react';

import AdminLayout from '@/components/admin/admin-layout';
import Panel from '@/components/admin/panel';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface DashboardProps {
    stats: {
        leads_total: number;
        leads_new: number;
        leads_30_days: number;
        portfolio_published: number;
        services_published: number;
        packages_published: number;
        brief_submissions_30_days: number;
        contact_clicks_30_days: number;
    };
    leadsByStatus: { status: string; label: string; tone: string; total: number }[];
    leadTrend: { label: string; total: number }[];
    recentLeads: {
        id: number;
        name: string;
        email: string;
        status: string;
        status_label: string;
        tone: string;
        context: string | null;
        created_at: string | null;
    }[];
    analytics: { tracking_since: string | null; events: { event: string; total: number }[] };
    today: string;
}

const EVENT_LABELS: Record<string, string> = {
    page_view: 'Halaman dilihat',
    service_view: 'Layanan dilihat',
    package_view: 'Paket dilihat',
    portfolio_view: 'Portfolio dilihat',
    portfolio_filter: 'Filter portfolio',
    project_brief_start: 'Brief dimulai',
    project_brief_submit: 'Brief dikirim',
    whatsapp_click: 'Klik WhatsApp',
    email_click: 'Klik email',
    package_cta_click: 'CTA paket',
    portfolio_cta_click: 'CTA portfolio',
};

export default function Dashboard({ stats, leadsByStatus, leadTrend, recentLeads, analytics }: DashboardProps) {
    const maxTrend = Math.max(1, ...leadTrend.map((item) => item.total));
    const funnel = leadsByStatus.filter((item) => item.status !== 'archived');
    const maxFunnel = Math.max(1, ...funnel.map((item) => item.total));

    const cards = [
        {
            label: 'Lead baru',
            value: stats.leads_new,
            hint: `${stats.leads_total} total lead`,
            icon: Inbox,
            href: '/admin/leads?status=new',
            accent: 'text-brand-600 bg-brand-50',
        },
        {
            label: 'Lead 30 hari',
            value: stats.leads_30_days,
            hint: `${stats.brief_submissions_30_days} brief terkirim`,
            icon: TrendingUp,
            href: '/admin/leads',
            accent: 'text-emerald-600 bg-emerald-50',
        },
        {
            label: 'Portfolio publik',
            value: stats.portfolio_published,
            hint: 'Status published',
            icon: FolderOpen,
            href: '/admin/portfolio',
            accent: 'text-indigo-600 bg-indigo-50',
        },
        {
            label: 'Kontak diklik',
            value: stats.contact_clicks_30_days,
            hint: 'WhatsApp + email, 30 hari',
            icon: MessageSquare,
            href: '/admin/settings',
            accent: 'text-amber-600 bg-amber-50',
        },
    ];

    return (
        <AdminLayout
            title="Dashboard"
            description="Ringkasan konten publik dan prospek masuk. Data analitik hanya mencakup peristiwa, bukan isi brief."
            actions={
                <>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/admin/leads">Lihat leads</Link>
                    </Button>
                    <Button asChild className="rounded-xl">
                        <Link href="/admin/portfolio/create">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Proyek baru
                        </Link>
                    </Button>
                </>
            }
            breadcrumbs={[{ label: 'Dashboard' }]}
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(({ label, value, hint, icon: Icon, href, accent }) => (
                    <Link
                        key={label}
                        href={href}
                        className="group rounded-2xl border border-border bg-white p-5 shadow-soft transition-shadow hover:shadow-card"
                    >
                        <div className="flex items-start justify-between">
                            <span className={cn('grid h-10 w-10 place-items-center rounded-xl', accent)}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-600" aria-hidden="true" />
                        </div>
                        <p className="mt-4 font-display text-2xl font-bold text-navy">{value}</p>
                        <p className="text-sm font-medium text-ink">{label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
                    </Link>
                ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <Panel title="Tren lead 6 bulan" description="Jumlah brief yang masuk per bulan.">
                    <div className="flex h-48 items-end gap-3">
                        {leadTrend.map((item) => (
                            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                                <span className="text-xs font-semibold text-navy">{item.total}</span>
                                <div className="flex w-full flex-1 items-end">
                                    <div
                                        className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                                        style={{ height: `${Math.max(4, (item.total / maxTrend) * 100)}%` }}
                                        role="img"
                                        aria-label={`${item.label}: ${item.total} lead`}
                                    />
                                </div>
                                <span className="text-[0.65rem] text-muted-foreground">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="Status lead" description="Distribusi seluruh lead yang tercatat.">
                    <ul className="space-y-3">
                        {funnel.map((item) => (
                            <li key={item.status}>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-ink">{item.label}</span>
                                    <span className="text-muted-foreground">{item.total}</span>
                                </div>
                                <div className="mt-1 h-2 overflow-hidden rounded-full bg-ice">
                                    <div
                                        className={cn(
                                            'h-full rounded-full',
                                            item.status === 'won'
                                                ? 'bg-success'
                                                : item.status === 'lost'
                                                  ? 'bg-danger'
                                                  : 'bg-brand-500',
                                        )}
                                        style={{ width: `${(item.total / maxFunnel) * 100}%` }}
                                    />
                                </div>
                            </li>
                        ))}
                        {funnel.length === 0 ? <li className="text-sm text-muted-foreground">Belum ada lead.</li> : null}
                    </ul>
                </Panel>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <Panel
                    title="Lead terbaru"
                    description="Lima brief terakhir yang masuk."
                    actions={
                        <Link href="/admin/leads" className="link-arrow text-xs">
                            Semua lead
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                    }
                    bodyClassName="p-0"
                >
                    {recentLeads.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table-shell">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Konteks</th>
                                        <th>Status</th>
                                        <th>Masuk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLeads.map((lead) => (
                                        <tr key={lead.id}>
                                            <td>
                                                <Link href={`/admin/leads/${lead.id}`} className="font-medium text-navy hover:text-brand-700">
                                                    {lead.name}
                                                </Link>
                                                <span className="block text-xs text-muted-foreground">{lead.email}</span>
                                            </td>
                                            <td className="text-xs text-muted-foreground">{lead.context ?? '—'}</td>
                                            <td>
                                                <StatusBadge value={lead.status} label={lead.status_label} tone={lead.tone} />
                                            </td>
                                            <td className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(lead.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="p-5 text-sm text-muted-foreground">Belum ada lead masuk.</p>
                    )}
                </Panel>

                <div className="space-y-5">
                    <Panel title="Ringkasan konten" bodyClassName="p-5">
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-ink">
                                    <Layers className="h-4 w-4 text-brand-600" aria-hidden="true" />
                                    Layanan publik
                                </span>
                                <span className="font-semibold text-navy">{stats.services_published}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-ink">
                                    <Package className="h-4 w-4 text-brand-600" aria-hidden="true" />
                                    Paket publik
                                </span>
                                <span className="font-semibold text-navy">{stats.packages_published}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-ink">
                                    <FolderOpen className="h-4 w-4 text-brand-600" aria-hidden="true" />
                                    Portfolio publik
                                </span>
                                <span className="font-semibold text-navy">{stats.portfolio_published}</span>
                            </li>
                        </ul>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-lg">
                                <Link href="/admin/services">Kelola layanan</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="rounded-lg">
                                <Link href="/admin/packages">Kelola paket</Link>
                            </Button>
                        </div>
                    </Panel>

                    <Panel
                        title="Aktivitas 30 hari"
                        description={analytics.tracking_since ? `Pelacakan aktif sejak ${formatDateTime(analytics.tracking_since)}` : 'Belum ada data'}
                        bodyClassName="p-5"
                    >
                        {analytics.events.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {analytics.events.slice(0, 6).map((event) => (
                                    <li key={event.event} className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-ink">
                                            <BarChart3 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                                            {EVENT_LABELS[event.event] ?? event.event}
                                        </span>
                                        <span className="font-semibold text-navy">{event.total}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Peristiwa analitik akan muncul setelah situs dikunjungi. Tidak ada data pribadi yang disimpan.
                            </p>
                        )}
                    </Panel>
                </div>
            </div>
        </AdminLayout>
    );
}
