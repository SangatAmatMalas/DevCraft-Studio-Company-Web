import { Link, router, usePage } from '@inertiajs/react';
import { Check, Clock, Copy, MailPlus, Pencil, Plus, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Panel from '@/components/admin/panel';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import type { SharedProps } from '@/types';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string | null;
}

interface InvitationRow {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
    invited_by: string | null;
    expires_at: string | null;
    expired: boolean;
}

interface UsersIndexProps {
    users: UserRow[];
    roles: Record<string, string>;
    invitations: InvitationRow[];
    invitationExpiresInDays: number;
}

function InvitationLink({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
            <p className="text-xs font-semibold text-brand-900">
                Tautan undangan sekali-tampil. Email juga dikirim otomatis, tetapi salin tautan ini jika SMTP belum siap.
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                    readOnly
                    value={url}
                    onFocus={(event) => event.currentTarget.select()}
                    className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-ink"
                />
                <Button type="button" variant="outline" className="shrink-0 rounded-lg" onClick={copy}>
                    {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    {copied ? 'Tersalin' : 'Salin'}
                </Button>
            </div>
        </div>
    );
}

export default function UsersIndex({ users, roles, invitations, invitationExpiresInDays }: UsersIndexProps) {
    const { flash } = usePage<SharedProps>().props;
    const invitationUrl = flash.invitation_url ?? null;

    function resend(invitation: InvitationRow) {
        router.post(`/admin/users/invitations/${invitation.id}/resend`, {}, { preserveScroll: true });
    }

    function revoke(invitation: InvitationRow) {
        if (!window.confirm(`Batalkan undangan untuk ${invitation.email}? Tautan yang sudah dikirim tidak akan berlaku lagi.`)) {
            return;
        }

        router.delete(`/admin/users/invitations/${invitation.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout
            title="Pengguna"
            description="Kelola akses admin. Peran menentukan menu dan tindakan yang dapat dilakukan."
            actions={
                <>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/admin/users/create">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Buat manual
                        </Link>
                    </Button>
                    <Button asChild className="rounded-xl">
                        <Link href="/admin/users/invite">
                            <UserPlus className="h-4 w-4" aria-hidden="true" />
                            Undang pengguna
                        </Link>
                    </Button>
                </>
            }
            breadcrumbs={[{ label: 'Pengguna' }]}
        >
            {invitationUrl ? <div className="mt-5"><InvitationLink url={invitationUrl} /></div> : null}

            {invitations.length > 0 ? (
                <Panel
                    className="mt-5"
                    title="Undangan menunggu"
                    description={`Tautan berlaku ${invitationExpiresInDays} hari dan hanya bisa dipakai sekali.`}
                    bodyClassName="p-0"
                >
                    <div className="overflow-x-auto">
                        <table className="table-shell">
                            <thead>
                                <tr>
                                    <th>Penerima</th>
                                    <th>Peran</th>
                                    <th>Berlaku sampai</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map((invitation) => (
                                    <tr key={invitation.id}>
                                        <td>
                                            <span className="font-medium text-navy">{invitation.name}</span>
                                            <span className="block text-xs text-muted-foreground">{invitation.email}</span>
                                            {invitation.invited_by ? (
                                                <span className="block text-[0.7rem] text-muted-foreground">Diundang oleh {invitation.invited_by}</span>
                                            ) : null}
                                        </td>
                                        <td className="text-xs text-ink">{roles[invitation.role] ?? invitation.role_label}</td>
                                        <td className="whitespace-nowrap text-xs">
                                            {invitation.expired ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 font-semibold text-danger ring-1 ring-inset ring-danger/20">
                                                    <Clock className="h-3 w-3" aria-hidden="true" />
                                                    Kedaluwarsa
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">{formatDateTime(invitation.expires_at)}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => resend(invitation)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Kirim ulang
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => revoke(invitation)}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                    Batalkan
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            ) : null}

            <Panel className="mt-5" bodyClassName="p-0">
                <div className="overflow-x-auto">
                    <table className="table-shell">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Peran</th>
                                <th>Status</th>
                                <th>Login terakhir</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <Link href={`/admin/users/${user.id}/edit`} className="font-medium text-navy hover:text-brand-700">
                                            {user.name}
                                        </Link>
                                        <span className="block text-xs text-muted-foreground">{user.email}</span>
                                    </td>
                                    <td className="text-xs text-ink">{roles[user.role] ?? user.role_label}</td>
                                    <td>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${
                                                user.is_active ? 'bg-success/10 text-success ring-success/20' : 'bg-slate-100 text-slate-500 ring-slate-200'
                                            }`}
                                        >
                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(user.last_login_at) || 'Belum pernah'}</td>
                                    <td>
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                            >
                                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                                Edit
                                            </Link>
                                            <ConfirmDelete
                                                url={`/admin/users/${user.id}`}
                                                title="Hapus pengguna ini?"
                                                description={`Akun “${user.name}” akan dihapus permanen dan tidak bisa masuk lagi.`}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>

            <Panel
                className="mt-5"
                title="Matriks peran"
                description="Worker hanya dapat membaca daftar preview desain. Data lead, konten, dan pengaturan tidak terbuka untuk peran ini."
                bodyClassName="p-5"
            >
                <div className="overflow-x-auto">
                    <table className="table-shell">
                        <thead>
                            <tr>
                                <th>Peran</th>
                                <th>Konten</th>
                                <th>Leads</th>
                                <th>Preview desain</th>
                                <th>Pengaturan</th>
                                <th>Pengguna</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="font-medium text-navy">Super Admin</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-navy">Admin</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Tidak</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-navy">Content Manager</td>
                                <td>Ya</td>
                                <td>Tidak</td>
                                <td>Ya</td>
                                <td>Tidak</td>
                                <td>Tidak</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-navy">Sales</td>
                                <td>Tidak</td>
                                <td>Ya</td>
                                <td>Ya</td>
                                <td>Tidak</td>
                                <td>Tidak</td>
                            </tr>
                            <tr>
                                <td className="font-medium text-navy">Pekerja / Produksi</td>
                                <td>Tidak</td>
                                <td>Tidak</td>
                                <td>Ya (baca saja)</td>
                                <td>Tidak</td>
                                <td>Tidak</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Panel>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <MailPlus className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Undangan mengirim tautan pembuatan kata sandi ke email penerima. Kata sandi tidak pernah dikirim melalui email
                atau chat. Gunakan “Buat manual” hanya jika email penerima belum siap.
            </p>
        </AdminLayout>
    );
}
