import { usePage } from '@inertiajs/react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { SharedProps } from '@/types';

export default function FlashToast() {
    const { flash } = usePage<SharedProps>().props;
    const [visible, setVisible] = useState(false);

    const message = flash.error ?? flash.success;
    const isError = Boolean(flash.error);

    useEffect(() => {
        if (!message) {
            return;
        }

        setVisible(true);
        const timeout = window.setTimeout(() => setVisible(false), 7000);

        return () => window.clearTimeout(timeout);
    }, [message, flash.error, flash.success]);

    if (!message || !visible) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-border bg-white p-4 shadow-card"
        >
            <div className="flex items-start gap-3">
                {isError ? (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                ) : (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                )}
                <p className="flex-1 text-sm text-ink">{message}</p>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
                    aria-label="Tutup notifikasi"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
