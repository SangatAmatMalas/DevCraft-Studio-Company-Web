import { Link, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, KeyRound, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import AuthShell from '@/components/auth/auth-shell';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvitationInfo {
    name: string;
    email: string;
    role_label: string;
}

interface AcceptInvitationProps {
    token: string;
    invitation: InvitationInfo | null;
    usable: boolean;
    accepted: boolean;
    expired: boolean;
}

export default function AcceptInvitation({ token, invitation, usable, accepted, expired }: AcceptInvitationProps) {
    const form = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post(`/undangan/${token}`, {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    if (!usable || !invitation) {
        const message = accepted
            ? 'Undangan ini sudah dipakai. Silakan masuk dengan kata sandi yang sudah Anda buat.'
            : expired
              ? 'Tautan undangan sudah kedaluwarsa. Minta Super Admin mengirim ulang undangan dari menu Pengguna.'
              : 'Tautan undangan tidak valid. Periksa kembali tautan dari email, atau minta Super Admin mengirim ulang.';

        return (
            <AuthShell
                title="Undangan tidak berlaku"
                heading="Undangan tidak berlaku"
                description="Tautan undangan bersifat sekali pakai dan memiliki masa berlaku."
                footer={
                    <p>
                        Sudah punya akses?{' '}
                        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                            Masuk ke admin
                        </Link>
                    </p>
                }
            >
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                    <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                        {message}
                    </p>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Buat kata sandi"
            heading={`Selamat datang, ${invitation.name}`}
            description="Buat kata sandi untuk mengaktifkan akun admin Anda. Kata sandi ini tidak dikirim ke siapa pun."
            footer={
                <p>
                    Sudah punya kata sandi?{' '}
                    <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                        Masuk ke admin
                    </Link>
                </p>
            }
        >
            <div className="mb-5 rounded-xl border border-border bg-ice/70 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium text-navy">
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    {invitation.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Peran: {invitation.role_label}</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <Label htmlFor="password">Kata sandi baru</Label>
                    <Input
                        id="password"
                        type="password"
                        value={form.data.password}
                        onChange={(event) => form.setData('password', event.target.value)}
                        autoComplete="new-password"
                        autoFocus
                        required
                        aria-invalid={Boolean(form.errors.password)}
                        className="mt-1.5"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">Minimal 12 karakter, kombinasi huruf dan angka.</p>
                    <InputError message={form.errors.password} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="password_confirmation">Ulangi kata sandi</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
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
                    Aktifkan akun
                </Button>
            </form>
        </AuthShell>
    );
}
