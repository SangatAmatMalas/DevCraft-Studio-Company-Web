import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import AuthShell from '@/components/auth/auth-shell';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const form = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/reset-password', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthShell
            title="Kata sandi baru"
            heading="Buat kata sandi baru"
            description="Pilih kata sandi yang kuat. Minimal 12 karakter dengan kombinasi huruf dan angka."
            footer={
                <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Kembali ke halaman masuk
                </Link>
            }
        >
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        autoComplete="username"
                        required
                        aria-invalid={Boolean(form.errors.email)}
                        className="mt-1.5"
                    />
                    <InputError message={form.errors.email} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="password">Kata sandi baru</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        autoComplete="new-password"
                        autoFocus
                        required
                        aria-invalid={Boolean(form.errors.password)}
                        className="mt-1.5"
                    />
                    <InputError message={form.errors.password} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="password_confirmation">Ulangi kata sandi</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={form.data.password_confirmation}
                        onChange={(event) => form.setData('password_confirmation', event.target.value)}
                        autoComplete="new-password"
                        required
                        aria-invalid={Boolean(form.errors.password_confirmation)}
                        className="mt-1.5"
                    />
                    <InputError message={form.errors.password_confirmation} className="mt-1" />
                </div>

                <Button type="submit" disabled={form.processing} className="w-full rounded-xl">
                    {form.processing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <KeyRound className="h-4 w-4" aria-hidden="true" />
                    )}
                    Simpan kata sandi
                </Button>
            </form>
        </AuthShell>
    );
}
