import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ExternalLink, Mail, MessageCircle, Save, Sparkles, User } from 'lucide-react';
import { FormEvent } from 'react';

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
}

const PREFERRED_LABELS: Record<string, string> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
    phone: 'Telepon',
};

export default function LeadShow({ lead, statuses }: { lead: LeadDetail; statuses: Record<string, string> }) {
    const statusForm = useForm({
        status: lead.status,
        next_follow_up_at: lead.next_follow_up_at ? lead.next_follow_up_at.slice(0, 10) : '',
    });
    const noteForm = useForm({ note: '' });

    const updateStatus = (event: FormEvent) => {
        event.preventDefault();
        statusForm.patch(`/admin/leads/${lead.id}`, { preserveScroll: true });
    };

    const addNote = (event: FormEvent) => {
        event.preventDefault();
        noteForm.post(`/admin/leads/${lead.id}/notes`, {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('note'),
        });
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
                            </div>

                            <div>
                                <Label htmlFor="next_follow_up_at">Follow-up berikutnya</Label>
                                <Input
                                    id="next_follow_up_at"
                                    type="date"
                                    value={statusForm.data.next_follow_up_at}
                                    onChange={(event) => statusForm.setData('next_follow_up_at', event.target.value)}
                                    className="mt-1.5"
                                />
                                <InputError message={statusForm.errors.next_follow_up_at} className="mt-1" />
                                <p className="field-hint">
                                    Kosongkan jika belum ada jadwal. Lead tanpa jadwal ditandai setelah 3 hari.
                                </p>
                            </div>

                            <Button type="submit" disabled={statusForm.processing} className="w-full rounded-lg">
                                {statusForm.processing ? 'Menyimpan…' : 'Simpan status'}
                            </Button>
                        </form>

                        <div className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                            {lead.follow_up_due ? (
                                <p className="font-medium text-danger">Perlu ditindaklanjuti sekarang.</p>
                            ) : null}
                            {lead.last_contacted_at ? (
                                <p>Terakhir dihubungi: {formatDateTime(lead.last_contacted_at)}</p>
                            ) : (
                                <p>Belum pernah ditandai dihubungi.</p>
                            )}
                        </div>
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
