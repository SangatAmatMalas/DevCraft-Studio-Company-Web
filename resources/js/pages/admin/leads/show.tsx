import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, CheckCircle2, Copy, ExternalLink, Mail, MessageCircle, PhoneCall, Save, Sparkles, User } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import Panel from '@/components/admin/panel';
import StatusBadge from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { formatDateTime } from '@/lib/format';

interface MailStatus {
    status: string;
    status_label: string;
    tone: string;
    recipient: string;
    error: string | null;
    created_at: string | null;
}

interface LeadDetail {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    organization: string | null;
    service_type: string | null;
    budget_range: string | null;
    target_timeline: string | null;
    preferred_contact: string | null;
    message: string;
    source_url: string | null;
    reference_url: string | null;
    source_type: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
    referrer: string | null;
    status: string;
    status_label: string;
    next_follow_up_at: string | null;
    last_contacted_at: string | null;
    follow_up_due: boolean;
    privacy_consent_at: string | null;
    created_at: string | null;
    package: { name: string; slug: string } | null;
    project: { title: string; slug: string } | null;
    attachments: { id: number; name: string; size: string; mime_type: string | null; download_url: string }[];
    design_brief: {
        token: string;
        brand_name: string;
        category_label: string;
        style_label: string;
        chosen_label: string | null;
        result_url: string;
    } | null;
    notes: { id: number; note: string; author: string; created_at: string | null }[];
    mail: {
        team_notification: MailStatus | null;
        lead_confirmation: MailStatus | null;
    };
}

interface ReplyTemplate {
    id: number;
    title: string;
    body: string;
}

const PREFERRED_LABELS: Record<string, string> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
    phone: 'Telepon',
};

export default function LeadShow({
    lead,
    statuses,
    templates,
}: {
    lead: LeadDetail;
    statuses: Record<string, string>;
    templates: ReplyTemplate[];
}) {
    const statusForm = useForm({
        status: lead.status,
        next_follow_up_at: lead.next_follow_up_at ? lead.next_follow_up_at.slice(0, 10) : '',
    });
    const followUpForm = useForm({
        next_follow_up_at: lead.next_follow_up_at ? lead.next_follow_up_at.slice(0, 10) : '',
    });
    const contactedForm = useForm({});
    const noteForm = useForm({ note: '' });
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const updateStatus = (event: FormEvent) => {
        event.preventDefault();
        statusForm.patch(`/admin/leads/${lead.id}`, { preserveScroll: true });
    };

    const saveFollowUp = (event: FormEvent) => {
        event.preventDefault();
        followUpForm.patch(`/admin/leads/${lead.id}/follow-up`, { preserveScroll: true });
    };

    const markContacted = () => {
        contactedForm.post(`/admin/leads/${lead.id}/contacted`, { preserveScroll: true });
    };

    const addNote = (event: FormEvent) => {
        event.preventDefault();
        noteForm.post(`/admin/leads/${lead.id}/notes`, {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('note'),
        });
    };

    const copyTemplate = async (template: ReplyTemplate) => {
        try {
            await navigator.clipboard.writeText(template.body);
            setCopiedId(template.id);
            window.setTimeout(() => setCopiedId((current) => (current === template.id ? null : current)), 2000);
        } catch {
            setCopiedId(null);
        }
    };

    const whatsappNumber = lead.phone ? lead.phone.replace(/[^\d]/g, '').replace(/^0/, '62') : null;
    const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo ${lead.name}, terima kasih sudah menghubungi DevCraft Studio.`)}`
        : null;
    const mailtoUrl = `mailto:${lead.email}?subject=${encodeURIComponent(`Tindak lanjut brief — ${lead.name}`)}`;

    const context = [
        lead.service_type ? { label: 'Jenis kebutuhan', value: lead.service_type } : null,
        lead.package ? { label: 'Paket', value: lead.package.name } : null,
        lead.project ? { label: 'Referensi proyek', value: lead.project.title } : null,
        lead.budget_range ? { label: 'Estimasi budget', value: lead.budget_range } : null,
        lead.target_timeline ? { label: 'Target waktu', value: lead.target_timeline } : null,
        lead.reference_url ? { label: 'Tautan referensi', value: lead.reference_url } : null,
        lead.preferred_contact ? { label: 'Cara dihubungi', value: PREFERRED_LABELS[lead.preferred_contact] ?? lead.preferred_contact } : null,
    ].filter(Boolean) as { label: string; value: string }[];

    return (
        <AdminLayout
            title={lead.name}
            description={`Brief masuk ${formatDateTime(lead.created_at)} · ${lead.email}`}
            breadcrumbs={[{ label: 'Leads', href: '/admin/leads' }, { label: lead.name }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/leads">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                        <a href={mailtoUrl}>
                            <Mail className="h-4 w-4" aria-hidden="true" />
                            Email
                        </a>
                    </Button>
                    {whatsappUrl ? (
                        <Button asChild variant="outline" className="rounded-xl">
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                WhatsApp
                            </a>
                        </Button>
                    ) : null}
                </>
            }
        >
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-5">
                    <Panel title="Isi brief" bodyClassName="p-5">
                        <dl className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nama</dt>
                                <dd className="mt-0.5 text-sm text-ink">{lead.name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</dt>
                                <dd className="mt-0.5 text-sm text-ink">
                                    <a href={`mailto:${lead.email}`} className="hover:text-brand-700">
                                        {lead.email}
                                    </a>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Telepon</dt>
                                <dd className="mt-0.5 text-sm text-ink">{lead.phone ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organisasi</dt>
                                <dd className="mt-0.5 text-sm text-ink">{lead.organization ?? '—'}</dd>
                            </div>
                        </dl>

                        {lead.design_brief ? (
                            <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
                                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                            Dari preview desain
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-navy">{lead.design_brief.brand_name}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {lead.design_brief.category_label} · {lead.design_brief.style_label}
                                            {lead.design_brief.chosen_label ? ` · ${lead.design_brief.chosen_label}` : ''}
                                        </p>
                                    </div>
                                    <a
                                        href={lead.design_brief.result_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                                    >
                                        Buka preview
                                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                    </a>
                                </div>
                            </div>
                        ) : null}

                        {context.length > 0 ? (
                            <dl className="mt-5 grid gap-3 rounded-xl border border-border bg-ice p-4 sm:grid-cols-2">
                                {context.map((item) => (
                                    <div key={item.label}>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                                        <dd className="mt-0.5 text-sm text-ink">
                                            {item.label === 'Tautan referensi' ? (
                                                <a
                                                    href={item.value}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="break-all text-brand-700 hover:underline"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                item.value
                                            )}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        ) : null}

                        <div className="mt-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pesan</p>
                            <div className="mt-2 whitespace-pre-line rounded-xl border border-border p-4 text-sm leading-relaxed text-ink/85">
                                {lead.message}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {lead.privacy_consent_at ? (
                                <span className="inline-flex items-center gap-1.5 text-success">
                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Persetujuan privasi {formatDateTime(lead.privacy_consent_at)}
                                </span>
                            ) : null}
                            {lead.source_url ? (
                                <span>
                                    Sumber:{' '}
                                    <a href={lead.source_url} className="text-brand-700 hover:underline" target="_blank" rel="noopener noreferrer">
                                        {lead.source_url}
                                    </a>
                                </span>
                            ) : null}
                            {lead.source_type ? <span>Kanal: {lead.source_type}</span> : null}
                        </div>
                    </Panel>

                    {lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.referrer ? (
                        <Panel title="Atribusi pemasaran" description="Sumber kampanye dan rujukan lead." bodyClassName="p-5">
                            <dl className="grid gap-3 sm:grid-cols-2">
                                {lead.utm_source ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">UTM Source</dt>
                                        <dd className="mt-0.5 text-sm font-medium text-navy">{lead.utm_source}</dd>
                                    </div>
                                ) : null}
                                {lead.utm_medium ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">UTM Medium</dt>
                                        <dd className="mt-0.5 text-sm font-medium text-navy">{lead.utm_medium}</dd>
                                    </div>
                                ) : null}
                                {lead.utm_campaign ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">UTM Campaign</dt>
                                        <dd className="mt-0.5 text-sm font-medium text-navy">{lead.utm_campaign}</dd>
                                    </div>
                                ) : null}
                                {lead.utm_term ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">UTM Term</dt>
                                        <dd className="mt-0.5 text-sm font-medium text-navy">{lead.utm_term}</dd>
                                    </div>
                                ) : null}
                                {lead.utm_content ? (
                                    <div>
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">UTM Content</dt>
                                        <dd className="mt-0.5 text-sm font-medium text-navy">{lead.utm_content}</dd>
                                    </div>
                                ) : null}
                                {lead.referrer ? (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Referrer Awal</dt>
                                        <dd className="mt-0.5 break-all text-sm font-medium text-navy">{lead.referrer}</dd>
                                    </div>
                                ) : null}
                            </dl>
                        </Panel>
                    ) : null}

                    {lead.attachments.length > 0 ? (
                        <Panel title="Lampiran" description="File yang dikirim bersama brief." bodyClassName="p-5">
                            <ul className="space-y-2">
                                {lead.attachments.map((attachment) => (
                                    <li
                                        key={attachment.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-ice/60 px-3 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-navy">{attachment.name}</p>
                                            <p className="text-xs text-muted-foreground">{attachment.size}</p>
                                        </div>
                                        <a
                                            href={attachment.download_url}
                                            className="shrink-0 text-xs font-semibold text-brand-700 hover:underline"
                                        >
                                            Unduh
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                    ) : null}

                    <Panel title="Catatan internal" description="Hanya terlihat oleh tim." bodyClassName="p-5">
                        <form onSubmit={addNote} className="space-y-2">
                            <Label htmlFor="note">Catatan baru</Label>
                            <Textarea
                                id="note"
                                rows={3}
                                value={noteForm.data.note}
                                onChange={(event) => noteForm.setData('note', event.target.value)}
                                placeholder="Ringkasan percakapan, kesepakatan, atau langkah berikutnya."
                                className="mt-1.5"
                            />
                            <InputError message={noteForm.errors.note} />
                            <div className="flex justify-end">
                                <Button type="submit" size="sm" disabled={noteForm.processing} className="rounded-lg">
                                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                    {noteForm.processing ? 'Menyimpan…' : 'Simpan catatan'}
                                </Button>
                            </div>
                        </form>

                        {lead.notes.length > 0 ? (
                            <ul className="mt-4 space-y-3 border-t border-border pt-4">
                                {lead.notes.map((note) => (
                                    <li key={note.id} className="rounded-xl border border-border bg-ice p-3">
                                        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/85">{note.note}</p>
                                        <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                                            <User className="h-3 w-3" aria-hidden="true" />
                                            {note.author} · {formatDateTime(note.created_at)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 text-xs text-muted-foreground">Belum ada catatan untuk lead ini.</p>
                        )}
                    </Panel>
                </div>

                <div className="space-y-5">
                    <Panel title="Status tindak lanjut" bodyClassName="p-5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Status saat ini:</span>
                            <StatusBadge value={lead.status} label={lead.status_label} />
                        </div>

                        <form onSubmit={updateStatus} className="mt-4 space-y-3">
                            <div>
                                <Label htmlFor="status">Ubah status</Label>
                                <NativeSelect
                                    id="status"
                                    value={statusForm.data.status}
                                    onChange={(event) => statusForm.setData('status', event.target.value)}
                                    className="mt-1.5"
                                >
                                    {Object.entries(statuses).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </NativeSelect>
                                <InputError message={statusForm.errors.status} className="mt-1" />
                                <p className="field-hint">Status hanya berubah saat Anda memilihnya di sini.</p>
                            </div>

                            <Button type="submit" disabled={statusForm.processing} className="w-full rounded-lg">
                                {statusForm.processing ? 'Menyimpan…' : 'Simpan status'}
                            </Button>
                        </form>

                        <div className="mt-4 space-y-3 border-t border-border pt-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kontak terakhir</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {lead.last_contacted_at
                                        ? `Terakhir dihubungi: ${formatDateTime(lead.last_contacted_at)}`
                                        : 'Belum pernah ditandai dihubungi.'}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={markContacted}
                                disabled={contactedForm.processing}
                                className="w-full justify-start rounded-lg"
                            >
                                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                                {contactedForm.processing ? 'Menyimpan…' : 'Tandai sudah dihubungi'}
                            </Button>
                            <p className="field-hint">Hanya mencatat waktu. Status lead tidak ikut berubah.</p>
                        </div>

                        <form onSubmit={saveFollowUp} className="mt-4 space-y-3 border-t border-border pt-4">
                            <div>
                                <Label htmlFor="follow_up_at">Jadwal follow-up</Label>
                                <Input
                                    id="follow_up_at"
                                    type="date"
                                    value={followUpForm.data.next_follow_up_at}
                                    onChange={(event) => followUpForm.setData('next_follow_up_at', event.target.value)}
                                    className="mt-1.5"
                                />
                                <InputError message={followUpForm.errors.next_follow_up_at} className="mt-1" />
                                <p className="field-hint">Kosongkan jika belum ada jadwal. Lead tanpa jadwal ditandai setelah 3 hari.</p>
                            </div>

                            <Button type="submit" variant="outline" disabled={followUpForm.processing} className="w-full rounded-lg">
                                {followUpForm.processing ? 'Menyimpan…' : 'Simpan jadwal'}
                            </Button>

                            {lead.follow_up_due ? <p className="text-xs font-medium text-danger">Perlu ditindaklanjuti sekarang.</p> : null}
                        </form>
                    </Panel>

                    <Panel title="Status email otomatis" description="Hasil pengiriman terakhir per jenis pesan." bodyClassName="p-5">
                        <ul className="space-y-3">
                            {[
                                { key: 'team_notification' as const, label: 'Notifikasi tim' },
                                { key: 'lead_confirmation' as const, label: 'Konfirmasi ke lead' },
                            ].map(({ key, label }) => {
                                const delivery = lead.mail[key];

                                return (
                                    <li key={key} className="rounded-xl border border-border bg-ice/60 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-medium text-navy">{label}</span>
                                            {delivery ? (
                                                <StatusBadge value={delivery.status} label={delivery.status_label} tone={delivery.tone} />
                                            ) : (
                                                <StatusBadge label="Belum dicoba" tone="muted" />
                                            )}
                                        </div>
                                        {delivery ? (
                                            <>
                                                <p className="mt-1 break-all text-[0.7rem] text-muted-foreground">
                                                    {delivery.recipient} · {formatDateTime(delivery.created_at)}
                                                </p>
                                                {delivery.error ? (
                                                    <p className="mt-1 line-clamp-3 text-[0.7rem] leading-relaxed text-danger">{delivery.error}</p>
                                                ) : null}
                                            </>
                                        ) : (
                                            <p className="mt-1 text-[0.7rem] text-muted-foreground">
                                                Belum ada percobaan pengiriman tercatat.
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            Email dikirim setelah respons selesai, jadi lead tetap tersimpan meskipun SMTP gagal.
                        </p>
                    </Panel>

                    <Panel
                        title="Template balasan"
                        description="Salin, lalu sesuaikan sebelum dikirim."
                        actions={
                            <Link href="/admin/lead-templates" className="link-arrow text-xs">
                                Kelola
                            </Link>
                        }
                        bodyClassName="p-5"
                    >
                        {templates.length > 0 ? (
                            <ul className="space-y-3">
                                {templates.map((template) => {
                                    const templateWaUrl = whatsappNumber
                                        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(template.body)}`
                                        : null;
                                    const templateMailUrl = lead.email
                                        ? `mailto:${lead.email}?subject=${encodeURIComponent(`Tindak lanjut brief — ${lead.name}`)}&body=${encodeURIComponent(template.body)}`
                                        : null;

                                    return (
                                        <li key={template.id} className="rounded-xl border border-border p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-navy">{template.title}</p>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    {templateWaUrl ? (
                                                        <a
                                                            href={templateWaUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success/5 px-2 py-1 text-xs font-semibold text-success hover:bg-success/15"
                                                            title="Kirim via WhatsApp"
                                                        >
                                                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Kirim WA
                                                        </a>
                                                    ) : null}
                                                    {templateMailUrl ? (
                                                        <a
                                                            href={templateMailUrl}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-ink/75 hover:bg-ice"
                                                            title="Kirim via Email"
                                                        >
                                                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                                            Email
                                                        </a>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        onClick={() => copyTemplate(template)}
                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                    >
                                                        {copiedId === template.id ? (
                                                            <>
                                                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Tersalin
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                                                Salin
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="mt-1.5 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                                                {template.body}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Belum ada template aktif.{' '}
                                <Link href="/admin/lead-templates" className="font-semibold text-brand-700 hover:underline">
                                    Buat template
                                </Link>
                                .
                            </p>
                        )}
                    </Panel>

                    <Panel title="Kontak cepat" bodyClassName="p-5">
                        <div className="space-y-2">
                            <Button asChild variant="outline" className="w-full justify-start rounded-lg">
                                <a href={mailtoUrl}>
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    Kirim email
                                </a>
                            </Button>
                            {whatsappUrl ? (
                                <Button asChild variant="outline" className="w-full justify-start rounded-lg">
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                        Chat WhatsApp
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            Tautan WhatsApp hanya dibuat jika nomor tersedia. Pastikan Anda menghubungi melalui kanal yang dipilih lead.
                        </p>
                    </Panel>

                    <Panel title="Etika data" bodyClassName="p-5">
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Data lead hanya digunakan untuk menindaklanjuti permintaan. Jangan menambahkan ke milis promosi atau membagikannya
                            tanpa persetujuan. Hapus data yang sudah tidak relevan sesuai kebijakan retensi.
                        </p>
                    </Panel>
                </div>
            </div>
        </AdminLayout>
    );
}
