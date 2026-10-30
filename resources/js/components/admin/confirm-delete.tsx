import { router } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function ConfirmDelete({
    url,
    title,
    description,
    triggerLabel = 'Hapus',
    triggerClassName,
    iconOnly = false,
}: {
    url: string;
    title: string;
    description: string;
    triggerLabel?: string;
    triggerClassName?: string;
    iconOnly?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const destroy = () => {
        router.delete(url, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className={
                        triggerClassName ??
                        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-danger transition-colors hover:bg-red-50'
                    }
                    aria-label={iconOnly ? triggerLabel : undefined}
                >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {iconOnly ? null : triggerLabel}
                </button>
            </DialogTrigger>
            <DialogContent>
                <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-danger">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <DialogTitle className="text-base font-bold text-navy">{title}</DialogTitle>
                        <DialogDescription className="mt-1.5 leading-relaxed">{description}</DialogDescription>
                    </div>
                </div>
                <DialogFooter className="mt-5">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
                        Batal
                    </Button>
                    <Button type="button" variant="destructive" onClick={destroy} disabled={processing}>
                        {processing ? 'Menghapus…' : 'Ya, hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
