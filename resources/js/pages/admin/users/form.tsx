import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { Field, FormSection, ToggleRow } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';

interface UserFormData {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
}

export default function UserForm({ user, roles }: { user: UserFormData | null; roles: Record<string, string> }) {
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        role: user?.role ?? 'content_manager',
        is_active: user?.is_active ?? true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onFinish: () => form.reset('password', 'password_confirmation'),
        };

        if (user) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/users/${user.id}`, options);
        } else {
            form.post('/admin/users', options);
        }
    };

    return (
        <AdminLayout
            title={user ? 'Edit pengguna' : 'Pengguna baru'}
            description="Gunakan kata sandi kuat minimal 12 karakter. Tidak ada pendaftaran mandiri."
            breadcrumbs={[{ label: 'Pengguna', href: '/admin/users' }, { label: user ? user.name : 'Baru' }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    <Button type="submit" form="user-form" disabled={form.processing} className="rounded-xl">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </>
            }
        >
            <form id="user-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <FormSection title="Identitas">
                    <Field label="Nama" htmlFor="name" required error={form.errors.name}>
                        <Input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                    </Field>

                    <Field label="Email" htmlFor="email" required error={form.errors.email}>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) => form.setData('email', event.target.value)}
                            autoComplete="off"
                            required
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Kata sandi"
                            htmlFor="password"
                            required={!user}
                            hint={user ? 'Kosongkan jika tidak ingin mengganti.' : 'Minimal 12 karakter, kombinasi huruf dan angka.'}
                            error={form.errors.password}
                        >
                            <Input
                                id="password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                autoComplete="new-password"
                            />
                        </Field>
                        <Field label="Ulangi kata sandi" htmlFor="password_confirmation" required={!user} error={form.errors.password_confirmation}>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                autoComplete="new-password"
                            />
                        </Field>
                    </div>
                </FormSection>

                <FormSection title="Akses">
                    <Field label="Peran" htmlFor="role" required error={form.errors.role}>
                        <NativeSelect
                            id="role"
                            value={form.data.role}
                            onChange={(event) => form.setData('role', event.target.value)}
                        >
                            {Object.entries(roles).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </NativeSelect>
                    </Field>

                    <ToggleRow
                        label="Akun aktif"
                        description="Akun nonaktif tidak dapat masuk ke area admin."
                        checked={form.data.is_active}
                        onChange={(value) => form.setData('is_active', value)}
                        error={form.errors.is_active}
                    />

                    {user ? (
                        <p className="rounded-xl border border-border bg-ice p-3 text-xs leading-relaxed text-muted-foreground">
                            Anda tidak dapat menonaktifkan atau menghapus akun sendiri. Minimal satu Super Admin aktif harus selalu tersedia.
                        </p>
                    ) : null}
                </FormSection>
            </form>
        </AdminLayout>
    );
}
