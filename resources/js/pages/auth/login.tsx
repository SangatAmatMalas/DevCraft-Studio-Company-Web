import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle, LogIn } from 'lucide-react';
import { FormEventHandler } from 'react';

import AuthShell from '@/components/auth/auth-shell';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const form = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/login', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <AuthShell
            title="Masuk ke admin"
            heading="Masuk ke admin"
            description="Gunakan akun administrator DevCraft Studio untuk mengelola konten dan prospek."
            footer={
                canResetPassword ? (
                    <p>
                        Lupa kata sandi?{' '}
                        <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline">
                            Minta tautan reset
                        </Link>
                    </p>
                ) : null
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

                <div>
                    <Label htmlFor="password">Kata sandi</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        autoComplete="current-password"
                        required
                        aria-invalid={Boolean(form.errors.password)}
                        className="mt-1.5"
                    />
                    <InputError message={form.errors.password} className="mt-1" />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="remember"
                        checked={form.data.remember}
                        onCheckedChange={(checked) => form.setData('remember', checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal text-ink/80">
                        Ingat perangkat ini
                    </Label>
                </div>

                <Button type="submit" disabled={form.processing} className="w-full rounded-xl">
                    {form.processing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <LogIn className="h-4 w-4" aria-hidden="true" />
                    )}
                    Masuk
                </Button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Tidak ada pendaftaran mandiri. Akun baru dibuat melalui undangan email atau ditambahkan langsung oleh Super Admin
                di menu Pengguna.
            </p>
        </AuthShell>
    );
}
