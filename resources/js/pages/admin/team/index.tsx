import { Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, ExternalLink, Pencil, Plus } from 'lucide-react';

import AdminLayout from '@/components/admin/admin-layout';
import ConfirmDelete from '@/components/admin/confirm-delete';
import Panel from '@/components/admin/panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MemberRow {
    id: number;
    name: string;
    role: string;
    bio: string | null;
    photo_url: string | null;
    skills: string[];
    github_url: string | null;
    linkedin_url: string | null;
    display_order: number;
    is_active: boolean;
    approved: boolean;
    published: boolean;
}

export default function TeamIndex({ members }: { members: MemberRow[] }) {
    const drafts = members.filter((member) => !member.published);
    const draftCount = drafts.length;
    const firstDraftHref = drafts.length > 0 ? `/admin/team/${drafts[0].id}/edit` : '/admin/team/create';

    return (
        <AdminLayout
            title="Tim"
            description="Profil hanya tampil setelah anggota menyetujui publikasi. Anggota yang belum disetujui tetap tersimpan sebagai draft."
            actions={
                <>
                    <Button asChild variant="outline" className="rounded-xl">
                        <a href="/tim" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            Lihat /tim
                        </a>
                    </Button>
                    <Button asChild className="rounded-xl">
                        <Link href="/admin/team/create">
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Anggota baru
                        </Link>
                    </Button>
                </>
            }
            breadcrumbs={[{ label: 'Tim' }]}
        >
            {draftCount > 0 ? (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                        {draftCount} anggota belum tampil di halaman <span className="font-semibold">/tim</span> karena belum aktif atau
                        persetujuan publikasinya belum dicatat.{' '}
                        <Link href={firstDraftHref} className="font-semibold underline underline-offset-4">
                            Lengkapi profil
                        </Link>
                        .
                    </p>
                </div>
            ) : null}

            <Panel bodyClassName="p-0">
                {members.length > 0 ? (
                    <ul className="divide-y divide-border">
                        {members.map((member) => (
                            <li key={member.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
                                {member.photo_url ? (
                                    <img src={member.photo_url} alt={member.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                                ) : (
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                                        {member.name.charAt(0).toUpperCase()}
                                    </span>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-navy">{member.name}</p>
                                        {member.published ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[0.65rem] font-semibold text-success ring-1 ring-inset ring-success/20">
                                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                Tampil
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                                                Tidak tampil
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                    {member.bio ? <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/75">{member.bio}</p> : null}
                                    {member.skills.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {member.skills.slice(0, 6).map((skill) => (
                                                <Badge key={skill} variant="secondary" className="text-[0.65rem] font-normal">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <Link
                                        href={`/admin/team/${member.id}/edit`}
                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                    >
                                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                        Edit
                                    </Link>
                                    <ConfirmDelete
                                        url={`/admin/team/${member.id}`}
                                        title="Hapus anggota tim ini?"
                                        description={`Profil “${member.name}” dan fotonya akan dihapus permanen.`}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h3 className="font-display text-base font-semibold text-navy">Belum ada anggota tim</h3>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Halaman /tim akan menampilkan empty state sampai ada profil yang disetujui dan diaktifkan.
                        </p>
                        <Button asChild className="mt-5 rounded-xl">
                            <Link href="/admin/team/create">Tambah anggota</Link>
                        </Button>
                    </div>
                )}
            </Panel>
        </AdminLayout>
    );
}
