import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MailPlus, Send } from 'lucide-react';
import { FormEvent } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { Field, FormSection } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';

interface InviteProps {
    roles: Record<string, string>;
    expiresInDays: number;
}

export default function InviteUser({ roles, expiresInDays }: InviteProps) {
    const form = useForm({
        name: '',
        email: '',
        role: 'content_manager',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post('/admin/users/invitations');
    }

    return (
        <AdminLayout
            title="Undang pengguna"
            description="Penerima membuat kata sandinya sendiri melalui tautan aman. Tidak ada kata sandi yang dikirim lewat email."
            breadcrumbs={[{ label: 'Pengguna', href: '/admin/users' }, { label: 'Undang' }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    <Button type="submit" form="invite-form" disabled={form.processing} className="rounded-xl">
                        <Send className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Mengirim…' : 'Kirim undangan'}
                    </Button>
                </>
            }
        >
            <form id="invite-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <FormSection title="Penerima undangan">
                    <Field label="Nama" htmlFor="name" required error={form.errors.name}>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="Nama lengkap penerima"
                            autoFocus
                            required
                        />
                    </Field>

                    <Field
                        label="Email"
                        htmlFor="email"
                        required
                        hint="Tautan undangan dikirim ke alamat ini. Pastikan email aktif dan bukan milik akun yang sudah ada."
                        error={form.errors.email}
                    >
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                            placeholder="nama@perusahaan.com"
                            autoComplete="off"
                            required
                        />
                    </Field>

                    <Field
                        label="Peran"
                        htmlFor="role"
                        required
                        hint="Peran menentukan menu dan tindakan yang tersedia setelah penerima masuk."
                        error={form.errors.role}
                    >
                        <NativeSelect id="role" value={form.data.role} onChange={(event) => form.setData('role', event.target.value)}>
                            {Object.entries(roles).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </NativeSelect>
                    </Field>
                </FormSection>

                <div className="space-y-5">
                    <div className="rounded-xl border border-border bg-white p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                            <MailPlus className="h-4 w-4 text-brand-700" aria-hidden="true" />
                            Cara kerja undangan
                        </div>
                        <ol className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                            <li>1. Sistem membuat tautan aman yang berlaku {expiresInDays} hari.</li>
                            <li>2. Penerima membuka tautan lalu membuat kata sandi sendiri (minimal 12 karakter).</li>
                            <li>3. Akun langsung aktif dan penerima otomatis masuk ke area admin.</li>
                        </ol>
                        <p className="mt-3 rounded-lg border border-border bg-ice p-3 text-xs leading-relaxed text-muted-foreground">
                            Jika email belum terkirim karena SMTP belum siap, halaman Pengguna menampilkan tautan sekali-tampil
                            yang bisa Anda salin manual.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-5">
                        <p className="text-sm font-semibold text-navy">Peran pekerja / produksi</p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            Pilih <strong>Pekerja / Produksi</strong> untuk staf yang hanya perlu melihat daftar preview desain.
                            Peran ini tidak dapat membuka data lead, konten, pengaturan, atau pengguna.
                        </p>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
