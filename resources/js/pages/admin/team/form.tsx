import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { ArrayField, Field, FormSection } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TeamExperienceItem } from '@/types';

interface MemberFormData {
    id: number;
    name: string;
    role: string;
    bio: string;
    photo_url: string | null;
    skills: string[];
    work_experience: TeamExperienceItem[];
    github_url: string;
    linkedin_url: string;
    display_order: number;
    is_active: boolean;
    approved: boolean;
}

export default function TeamForm({ member }: { member: MemberFormData | null }) {
    const [experience, setExperience] = useState<TeamExperienceItem[]>(
        member?.work_experience?.length
            ? member.work_experience
            : [{ role: '', organization: '', period: '', summary: '' }],
    );

    const form = useForm({
        name: member?.name ?? '',
        role: member?.role ?? '',
        bio: member?.bio ?? '',
        photo: null as File | null,
        skills: member?.skills?.length ? member.skills : [''],
        work_experience: experience,
        github_url: member?.github_url ?? '',
        linkedin_url: member?.linkedin_url ?? '',
        display_order: member?.display_order ?? 0,
        is_active: member?.is_active ?? false,
        approved: member?.approved ?? false,
    });

    const updateExperience = (next: TeamExperienceItem[]) => {
        setExperience(next);
        form.setData('work_experience', next);
    };

    const patchExperience = (index: number, patch: Partial<TeamExperienceItem>) => {
        updateExperience(experience.map((item, position) => (position === index ? { ...item, ...patch } : item)));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = { preserveScroll: true, forceFormData: true };

        if (member) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/team/${member.id}`, options);
        } else {
            form.post('/admin/team', options);
        }
    };

    return (
        <AdminLayout
            title={member ? 'Edit anggota tim' : 'Anggota tim baru'}
            description="Hanya tampilkan profil yang sudah disetujui oleh anggota tersebut."
            breadcrumbs={[{ label: 'Tim', href: '/admin/team' }, { label: member ? member.name : 'Baru' }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/team">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    <Button type="submit" form="team-form" disabled={form.processing} className="rounded-xl">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </>
            }
        >
            <form id="team-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-5">
                    <FormSection title="Profil">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Nama" htmlFor="name" required error={form.errors.name}>
                                <Input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                            </Field>
                            <Field label="Peran" htmlFor="role" required error={form.errors.role}>
                                <Input
                                    id="role"
                                    value={form.data.role}
                                    onChange={(event) => form.setData('role', event.target.value)}
                                    placeholder="Contoh: Full-stack developer"
                                    required
                                />
                            </Field>
                        </div>

                        <Field label="Bio singkat" htmlFor="bio" hint="Tulis keahlian dan fokus kerja, bukan klaim berlebihan." error={form.errors.bio}>
                            <Textarea id="bio" rows={4} value={form.data.bio} onChange={(event) => form.setData('bio', event.target.value)} />
                        </Field>

                        <div>
                            <Label htmlFor="photo">Foto (opsional)</Label>
                            {member?.photo_url ? (
                                <img src={member.photo_url} alt={member.name} className="mt-2 h-20 w-20 rounded-2xl object-cover" />
                            ) : null}
                            <Input
                                id="photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event: ChangeEvent<HTMLInputElement>) => form.setData('photo', event.target.files?.[0] ?? null)}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.photo} className="mt-1" />
                        </div>

                        <ArrayField
                            label="Keahlian"
                            values={form.data.skills}
                            onChange={(values) => form.setData('skills', values)}
                            placeholder="Contoh: Laravel"
                            addLabel="Tambah keahlian"
                            max={30}
                            error={form.errors.skills}
                        />
                    </FormSection>

                    <FormSection title="Pengalaman kerja">
                        <div>
                            <p className="field-hint">
                                Isi hanya pengalaman yang benar-benar dijalani dan sudah disetujui anggota. Periode ditulis bebas, mis.
                                “2023 — sekarang”.
                            </p>

                            <div className="mt-3 space-y-3">
                                {experience.map((item, index) => (
                                    <div key={index} className="rounded-xl border border-border p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Pengalaman {index + 1}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => updateExperience(experience.filter((_, position) => position !== index))}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                                                aria-label={`Hapus pengalaman ${index + 1}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                                Hapus
                                            </button>
                                        </div>

                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <Label htmlFor={`experience-role-${index}`}>Posisi</Label>
                                                <Input
                                                    id={`experience-role-${index}`}
                                                    value={item.role}
                                                    onChange={(event) => patchExperience(index, { role: event.target.value })}
                                                    placeholder="Full-stack developer"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`experience-organization-${index}`}>Organisasi</Label>
                                                <Input
                                                    id={`experience-organization-${index}`}
                                                    value={item.organization}
                                                    onChange={(event) => patchExperience(index, { organization: event.target.value })}
                                                    placeholder="Nama perusahaan atau kampus"
                                                    className="mt-1.5"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <Label htmlFor={`experience-period-${index}`}>Periode</Label>
                                            <Input
                                                id={`experience-period-${index}`}
                                                value={item.period}
                                                onChange={(event) => patchExperience(index, { period: event.target.value })}
                                                placeholder="2023 — sekarang"
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div className="mt-3">
                                            <Label htmlFor={`experience-summary-${index}`}>Ringkasan</Label>
                                            <Textarea
                                                id={`experience-summary-${index}`}
                                                rows={2}
                                                value={item.summary}
                                                onChange={(event) => patchExperience(index, { summary: event.target.value })}
                                                placeholder="Kontribusi utama, tanpa klaim yang tidak bisa dibuktikan."
                                                className="mt-1.5"
                                            />
                                            <p className="field-hint">Baris baru dipertahankan di halaman publik — tulis satu proyek per baris.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {experience.length < 8 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 rounded-lg"
                                    onClick={() => updateExperience([...experience, { role: '', organization: '', period: '', summary: '' }])}
                                >
                                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                    Tambah pengalaman
                                </Button>
                            ) : null}

                            <InputError message={form.errors.work_experience} className="mt-1" />
                        </div>
                    </FormSection>

                    <FormSection title="Tautan">
                        <Field label="GitHub" htmlFor="github_url" error={form.errors.github_url}>
                            <Input
                                id="github_url"
                                type="url"
                                placeholder="https://github.com/…"
                                value={form.data.github_url}
                                onChange={(event) => form.setData('github_url', event.target.value)}
                            />
                        </Field>
                        <Field label="LinkedIn" htmlFor="linkedin_url" error={form.errors.linkedin_url}>
                            <Input
                                id="linkedin_url"
                                type="url"
                                placeholder="https://linkedin.com/in/…"
                                value={form.data.linkedin_url}
                                onChange={(event) => form.setData('linkedin_url', event.target.value)}
                            />
                        </Field>
                    </FormSection>
                </div>

                <div className="space-y-5">
                    <FormSection title="Publikasi">
                        <div>
                            <Label htmlFor="display_order">Urutan tampil</Label>
                            <Input
                                id="display_order"
                                type="number"
                                min={0}
                                value={form.data.display_order}
                                onChange={(event) => form.setData('display_order', Number(event.target.value))}
                                className="mt-1.5"
                            />
                            <InputError message={form.errors.display_order} className="mt-1" />
                        </div>

                        <label className="flex items-start gap-2 rounded-xl border border-border bg-white p-3.5 text-sm text-ink/85">
                            <input
                                type="checkbox"
                                checked={form.data.approved}
                                onChange={(event) => form.setData('approved', event.target.checked)}
                                className="mt-0.5 h-4 w-4 accent-brand-600"
                            />
                            <span>
                                Anggota sudah menyetujui publikasi profil, termasuk pengalaman kerja.
                                <span className="mt-0.5 block text-xs text-muted-foreground">Wajib dicentang sebelum profil ditampilkan.</span>
                            </span>
                        </label>
                        <InputError message={form.errors.approved} />

                        <label className="flex items-start gap-2 rounded-xl border border-border bg-white p-3.5 text-sm text-ink/85">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(event) => form.setData('is_active', event.target.checked)}
                                className="mt-0.5 h-4 w-4"
                            />
                            <span>
                                Aktif dan tampil di halaman publik.
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    Profil hanya tampil jika aktif dan sudah disetujui.
                                </span>
                            </span>
                        </label>
                        <InputError message={form.errors.is_active} />
                    </FormSection>
                </div>
            </form>
        </AdminLayout>
    );
}
