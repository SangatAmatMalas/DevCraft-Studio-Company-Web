import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import AuthShell from '@/components/auth/auth-shell';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword({ status }: { status?: string }) {
    const form = useForm({ email: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/forgot-password');
    };

    return (
        <AuthShell
            title="Lupa kata sandi"
            heading="Atur ulang kata sandi"
            description="Masukkan email akun admin Anda. Kami akan mengirim tautan untuk membuat kata sandi baru jika email tersebut terdaftar."
            footer={
                <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Kembali ke halaman masuk
                </Link>
            }
        >
            {status ? (
                <div className="mb-4 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">{status}</div>
            ) : null}

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
                        autoFocus
                        required
                        aria-invalid={Boolean(form.errors.email)}
                        className="mt-1.5"
                    />
                    <InputError message={form.errors.email} className="mt-1" />
                </div>

                <Button type="submit" disabled={form.processing} className="w-full rounded-xl">
                    {form.processing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <Mail className="h-4 w-4" aria-hidden="true" />
                    )}
                    Kirim tautan reset
                </Button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Email reset dikirim melalui konfigurasi SMTP pada menu Pengaturan. Jika SMTP belum dikonfigurasi, hubungi
                Super Admin untuk mengatur kata sandi secara langsung.
            </p>
        </AuthShell>
    );
}
