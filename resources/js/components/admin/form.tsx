import { Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function Field({
    label,
    htmlFor,
    hint,
    error,
    required,
    children,
    className,
}: {
    label: string;
    htmlFor?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <Label htmlFor={htmlFor}>
                {label}
                {required ? <span className="ml-0.5 text-danger">*</span> : null}
            </Label>
            <div className="mt-1.5">{children}</div>
            {hint ? <p className="field-hint">{hint}</p> : null}
            <InputError message={error} className="mt-1" />
        </div>
    );
}

export function ArrayField({
    label,
    values,
    onChange,
    placeholder,
    hint,
    error,
    addLabel = 'Tambah item',
    max = 40,
}: {
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    hint?: string;
    error?: string;
    addLabel?: string;
    max?: number;
}) {
    const update = (index: number, value: string) => {
        const next = [...values];
        next[index] = value;
        onChange(next);
    };

    const remove = (index: number) => {
        onChange(values.filter((_, position) => position !== index));
    };

    return (
        <div>
            <Label>{label}</Label>
            {hint ? <p className="field-hint mb-2">{hint}</p> : null}

            <div className="mt-2 space-y-2">
                {values.map((value, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <Input
                            value={value}
                            onChange={(event) => update(index, event.target.value)}
                            placeholder={placeholder}
                            aria-label={`${label} ${index + 1}`}
                        />
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-danger"
                            aria-label={`Hapus ${label} ${index + 1}`}
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                ))}
            </div>

            {values.length < max ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 rounded-lg"
                    onClick={() => onChange([...values, ''])}
                >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    {addLabel}
                </Button>
            ) : null}

            <InputError message={error} className="mt-1" />
        </div>
    );
}

export function ToggleRow({
    label,
    description,
    checked,
    onChange,
    error,
    className,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    error?: string;
    className?: string;
}) {
    return (
        <div className={cn('flex items-start gap-3 rounded-xl border border-border bg-white p-3.5', className)}>
            <Checkbox id={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
            <div className="min-w-0">
                <Label htmlFor={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm font-medium text-ink">
                    {label}
                </Label>
                {description ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
                <InputError message={error} className="mt-1" />
            </div>
        </div>
    );
}

export function FormSection({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('rounded-2xl border border-border bg-white shadow-soft', className)}>
            <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-sm font-bold text-navy">{title}</h2>
                {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
            </div>
            <div className="space-y-5 p-5">{children}</div>
        </section>
    );
}
