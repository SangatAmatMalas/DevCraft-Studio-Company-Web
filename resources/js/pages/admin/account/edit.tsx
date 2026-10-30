import { useForm } from '@inertiajs/react';
import { Save, ShieldCheck } from 'lucide-react';
import { FormEvent } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { Field, FormSection } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AccountData {
    name: string;
    email: string;
    role_label: string;
}

export default function AccountEdit({ account }: { account: AccountData }) {
    const profileForm = useForm({
        name: account.name,
        email: account.email,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        profileForm.put('/admin/akun', {
            preserveScroll: true,
            onFinish: () => profileForm.reset('current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <AdminLayout
            title="Akun saya"
            description="Perbarui identitas dan kata sandi akun yang sedang digunakan."
            breadcrumbs={[{ label: 'Akun saya' }]}
            actions={
                <Button type="submit" form="account-form" disabled={profileForm.processing} className="rounded-xl">
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {profileForm.processing ? 'Menyimpan…' : 'Simpan'}
                </Button>
            }
        >
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <FormSection title="Profil">
                    <form id="account-form" onSubmit={submit} className="space-y-5">
                        <Field label="Nama" htmlFor="account-name" required error={profileForm.errors.name}>
                            <Input
                                id="account-name"
                                value={profileForm.data.name}
                                onChange={(event) => profileForm.setData('name', event.target.value)}
                                required
                            />
                        </Field>

                        <Field label="Email" htmlFor="account-email" required error={profileForm.errors.email}>
                            <Input
                                id="account-email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(event) => profileForm.setData('email', event.target.value)}
                                required
                            />
                        </Field>

                        <div className="border-t border-border pt-5">
                            <p className="text-sm font-semibold text-navy">Ganti kata sandi</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Kosongkan jika tidak ingin mengganti kata sandi.</p>
                        </div>

                        <Field
                            label="Kata sandi saat ini"
                            htmlFor="current-password"
                            hint="Diperlukan hanya jika Anda mengganti kata sandi."
                            error={profileForm.errors.current_password}
                        >
                            <Input
                                id="current-password"
                                type="password"
                                value={profileForm.data.current_password}
                                onChange={(event) => profileForm.setData('current_password', event.target.value)}
                                autoComplete="current-password"
                            />
                        </Field>

                        <Field label="Kata sandi baru" htmlFor="new-password" hint="Minimal 12 karakter, kombinasi huruf dan angka." error={profileForm.errors.password}>
                            <Input
                                id="new-password"
                                type="password"
                                value={profileForm.data.password}
                                onChange={(event) => profileForm.setData('password', event.target.value)}
                                autoComplete="new-password"
                            />
                        </Field>

                        <Field label="Ulangi kata sandi baru" htmlFor="new-password-confirmation" error={profileForm.errors.password_confirmation}>
                            <Input
                                id="new-password-confirmation"
                                type="password"
                                value={profileForm.data.password_confirmation}
                                onChange={(event) => profileForm.setData('password_confirmation', event.target.value)}
                                autoComplete="new-password"
                            />
                        </Field>

                        <Button type="submit" disabled={profileForm.processing} className="rounded-lg">
                            {profileForm.processing ? 'Menyimpan…' : 'Simpan perubahan'}
                        </Button>
                    </form>
                </FormSection>

                <div className="space-y-5">
                    <FormSection title="Peran Anda">
                        <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/60 p-3">
                            <ShieldCheck className="h-4 w-4 text-brand-700" aria-hidden="true" />
                            <span className="text-sm font-medium text-navy">{account.role_label}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Peran menentukan menu yang tersedia. Hubungi Super Admin jika akses perlu diubah.
                        </p>
                    </FormSection>

                    <FormSection title="Keamanan">
                        <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                            <li>• Gunakan kata sandi unik yang tidak dipakai di layanan lain.</li>
                            <li>• Jangan bagikan akun admin. Setiap pengguna sebaiknya memiliki akun sendiri.</li>
                            <li>• Perubahan kata sandi akan dicatat pada activity log.</li>
                        </ul>
                    </FormSection>
                </div>
            </div>
        </AdminLayout>
    );
}
