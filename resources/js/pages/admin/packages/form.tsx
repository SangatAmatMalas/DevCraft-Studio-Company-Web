import { Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Plus, Save, Trash2, Upload } from 'lucide-react';
import { FormEvent, useState } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { ArrayField, Field, FormSection, ToggleRow } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import type { FormObject } from '@/types';

interface AddonItem extends FormObject {
    id?: number;
    name: string;
    description: string;
    price_label: string;
    is_active: boolean;
}

interface PackageFormData {
    id: number;
    name: string;
    slug: string;
    tagline: string;
    target_audience: string;
    price_amount: number | null;
    price_label: string;
    currency: string;
    billing_type: string;
    timeline_label: string;
    revision_policy: string;
    included_items: string[];
    excluded_items: string[];
    limitations: string[];
    addons: AddonItem[];
    is_featured: boolean;
    display_order: number;
    status: string;
    meta_title: string;
    meta_description: string;
}

export default function PackageForm({
    package: pkg,
    billingTypes,
}: {
    package: PackageFormData | null;
    billingTypes: Record<string, string>;
}) {
    const [addons, setAddons] = useState<AddonItem[]>(
        pkg?.addons?.length ? pkg.addons : [{ name: '', description: '', price_label: '', is_active: true }],
    );

    const form = useForm({
        name: pkg?.name ?? '',
        slug: pkg?.slug ?? '',
        tagline: pkg?.tagline ?? '',
        target_audience: pkg?.target_audience ?? '',
        price_amount: pkg?.price_amount ?? (null as number | null),
        price_label: pkg?.price_label ?? '',
        currency: pkg?.currency ?? 'IDR',
        billing_type: pkg?.billing_type ?? 'one_time',
        timeline_label: pkg?.timeline_label ?? '',
        revision_policy: pkg?.revision_policy ?? '',
        included_items: pkg?.included_items?.length ? pkg.included_items : [''],
        excluded_items: pkg?.excluded_items?.length ? pkg.excluded_items : [''],
        limitations: pkg?.limitations?.length ? pkg.limitations : [''],
        addons: addons as AddonItem[],
        is_featured: pkg?.is_featured ?? false,
        display_order: pkg?.display_order ?? 0,
        meta_title: pkg?.meta_title ?? '',
        meta_description: pkg?.meta_description ?? '',
        publish: pkg?.status === 'published' || false,
    });

    const updateAddons = (next: AddonItem[]) => {
        setAddons(next);
        form.setData('addons', next);
    };

    const isCustom = form.data.billing_type === 'custom';
    const hasPrice = (form.data.price_amount ?? 0) > 0 || form.data.price_label.trim() !== '';

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const requestOptions = { preserveScroll: true };

        if (pkg) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(`/admin/packages/${pkg.slug}`, requestOptions);
        } else {
            form.post('/admin/packages', requestOptions);
        }
    };

    const togglePublish = () => {
        if (!pkg) {
            return;
        }

        const url = pkg.status === 'published' ? `/admin/packages/${pkg.slug}/unpublish` : `/admin/packages/${pkg.slug}/publish`;
        router.post(url, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            title={pkg ? 'Edit paket' : 'Paket baru'}
            description="Cantumkan harga final atau pilih custom quotation. Placeholder harga tidak diizinkan tampil di situs."
            breadcrumbs={[{ label: 'Paket', href: '/admin/packages' }, { label: pkg ? pkg.name : 'Baru' }]}
            actions={
                <>
                    <Button asChild variant="ghost" className="rounded-xl">
                        <Link href="/admin/packages">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali
                        </Link>
                    </Button>
                    {pkg ? (
                        <>
                            {pkg.status === 'published' ? (
                                <Button asChild variant="outline" className="rounded-xl">
                                    <a href={`/paket/${pkg.slug}`} target="_blank" rel="noopener noreferrer">
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                        Lihat
                                    </a>
                                </Button>
                            ) : null}
                            <Button type="button" variant="outline" className="rounded-xl" onClick={togglePublish}>
                                {pkg.status === 'published' ? (
                                    <>
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                        Jadikan draft
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4" aria-hidden="true" />
                                        Publikasikan
                                    </>
                                )}
                            </Button>
                        </>
                    ) : null}
                    <Button type="submit" form="package-form" disabled={form.processing} className="rounded-xl">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                    </Button>
                </>
            }
        >
            <form id="package-form" onSubmit={submit} className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="space-y-5">
                    <FormSection title="Informasi dasar">
                        <Field label="Nama paket" htmlFor="name" required error={form.errors.name}>
                            <Input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Slug" htmlFor="slug" hint="Kosongkan untuk dibuat otomatis." error={form.errors.slug}>
                                <Input
                                    id="slug"
                                    value={form.data.slug}
                                    onChange={(event) => form.setData('slug', event.target.value)}
                                    placeholder="contoh-nama-paket"
                                />
                            </Field>
                            <Field label="Urutan tampil" htmlFor="display_order" error={form.errors.display_order}>
                                <Input
                                    id="display_order"
                                    type="number"
                                    min={0}
                                    value={form.data.display_order}
                                    onChange={(event) => form.setData('display_order', Number(event.target.value))}
                                />
                            </Field>
                        </div>

                        <Field label="Tagline" htmlFor="tagline" hint="Satu kalimat singkat tentang paket ini." error={form.errors.tagline}>
                            <Input id="tagline" value={form.data.tagline} onChange={(event) => form.setData('tagline', event.target.value)} />
                        </Field>

                        <Field label="Target pengguna" htmlFor="target_audience" hint="Contoh: usaha jasa dengan 1–5 orang." error={form.errors.target_audience}>
                            <Input
                                id="target_audience"
                                value={form.data.target_audience}
                                onChange={(event) => form.setData('target_audience', event.target.value)}
                            />
                        </Field>
                    </FormSection>

                    <FormSection title="Harga" description="Isi nominal final, atau biarkan kosong dan gunakan custom quotation.">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Billing type" htmlFor="billing_type" required error={form.errors.billing_type}>
                                <NativeSelect
                                    id="billing_type"
                                    value={form.data.billing_type}
                                    onChange={(event) => form.setData('billing_type', event.target.value)}
                                >
                                    {Object.entries(billingTypes).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Field>

                            <Field label="Mata uang" htmlFor="currency" required error={form.errors.currency}>
                                <Input
                                    id="currency"
                                    maxLength={3}
                                    value={form.data.currency}
                                    onChange={(event) => form.setData('currency', event.target.value.toUpperCase())}
                                />
                            </Field>
                        </div>

                        <Field
                            label="Nominal harga"
                            htmlFor="price_amount"
                            hint="Angka saja, tanpa titik atau simbol. Kosongkan jika custom quotation."
                            error={form.errors.price_amount}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Rp</span>
                                <Input
                                    id="price_amount"
                                    type="number"
                                    min={0}
                                    step={1000}
                                    disabled={isCustom}
                                    value={form.data.price_amount ?? ''}
                                    onChange={(event) => form.setData('price_amount', event.target.value === '' ? null : Number(event.target.value))}
                                />
                            </div>
                        </Field>

                        <Field
                            label="Label harga alternatif"
                            htmlFor="price_label"
                            hint="Gunakan hanya untuk label yang jelas, misalnya “Mulai dari Rp 8.500.000”. Placeholder “Rp X” ditolak."
                            error={form.errors.price_label}
                        >
                            <Input
                                id="price_label"
                                value={form.data.price_label}
                                disabled={isCustom}
                                onChange={(event) => form.setData('price_label', event.target.value)}
                                placeholder="Mulai dari Rp 8.500.000"
                            />
                        </Field>

                        <Field label="Estimasi waktu" htmlFor="timeline_label" hint="Contoh: 4–6 minggu." error={form.errors.timeline_label}>
                            <Input
                                id="timeline_label"
                                value={form.data.timeline_label}
                                onChange={(event) => form.setData('timeline_label', event.target.value)}
                            />
                        </Field>

                        <Field label="Kebijakan revisi" htmlFor="revision_policy" error={form.errors.revision_policy}>
                            <Textarea
                                id="revision_policy"
                                rows={3}
                                value={form.data.revision_policy}
                                onChange={(event) => form.setData('revision_policy', event.target.value)}
                            />
                        </Field>

                        {!isCustom && !hasPrice ? (
                            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                Paket ini belum bisa dipublikasikan sampai nominal atau label harga diisi, atau billing type diganti ke custom quotation.
                            </div>
                        ) : null}
                    </FormSection>

                    <FormSection title="Cakupan" description="Pisahkan dengan jelas antara yang termasuk, tidak termasuk, dan batasan.">
                        <ArrayField
                            label="Termasuk"
                            values={form.data.included_items}
                            onChange={(values) => form.setData('included_items', values)}
                            placeholder="Contoh: halaman responsif hingga 5 halaman"
                            addLabel="Tambah item"
                            max={40}
                            error={form.errors.included_items}
                        />

                        <ArrayField
                            label="Tidak termasuk"
                            values={form.data.excluded_items}
                            onChange={(values) => form.setData('excluded_items', values)}
                            placeholder="Contoh: penulisan konten dari nol"
                            addLabel="Tambah item"
                            max={40}
                            error={form.errors.excluded_items}
                        />

                        <ArrayField
                            label="Batasan"
                            values={form.data.limitations}
                            onChange={(values) => form.setData('limitations', values)}
                            placeholder="Contoh: maksimal 2 putaran revisi desain"
                            addLabel="Tambah batasan"
                            max={40}
                            error={form.errors.limitations}
                        />
                    </FormSection>

                    <FormSection title="Add-on" description="Layanan tambahan opsional. Kosongkan nama jika tidak dipakai.">
                        <div className="space-y-3">
                            {addons.map((addon, index) => (
                                <div key={addon.id ?? `new-${index}`} className="rounded-xl border border-border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add-on {index + 1}</p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateAddons(
                                                    addons.map((item, position) =>
                                                        position === index ? { ...item, name: '' } : item,
                                                    ),
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                                            aria-label={`Kosongkan add-on ${index + 1}`}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 accent-brand-600" aria-hidden="true" />
                                            Kosongkan
                                        </button>
                                    </div>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor={`addon-name-${index}`}>Nama</Label>
                                            <Input
                                                id={`addon-name-${index}`}
                                                value={addon.name}
                                                onChange={(event) =>
                                                    updateAddons(
                                                        addons.map((item, position) =>
                                                            position === index ? { ...item, name: event.target.value } : item,
                                                        ),
                                                    )
                                                }
                                                className="mt-1.5"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`addon-price-${index}`}>Label harga</Label>
                                            <Input
                                                id={`addon-price-${index}`}
                                                value={addon.price_label}
                                                onChange={(event) =>
                                                    updateAddons(
                                                        addons.map((item, position) =>
                                                            position === index ? { ...item, price_label: event.target.value } : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Rp 1.500.000"
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <Label htmlFor={`addon-description-${index}`}>Deskripsi</Label>
                                        <Textarea
                                            id={`addon-description-${index}`}
                                            rows={2}
                                            value={addon.description}
                                            onChange={(event) =>
                                                updateAddons(
                                                    addons.map((item, position) =>
                                                        position === index ? { ...item, description: event.target.value } : item,
                                                    ),
                                                )
                                            }
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <label className="mt-3 inline-flex items-center gap-2 text-xs text-ink/80">
                                        <input
                                            type="checkbox"
                                            checked={addon.is_active}
                                            onChange={(event) =>
                                                updateAddons(
                                                    addons.map((item, position) =>
                                                        position === index ? { ...item, is_active: event.target.checked } : item,
                                                    ),
                                                )
                                            }
                                            className="h-3.5 w-3.5 accent-brand-600"
                                        />
                                        Tampilkan add-on ini
                                    </label>
                                </div>
                            ))}
                        </div>

                        {addons.length < 20 ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => updateAddons([...addons, { name: '', description: '', price_label: '', is_active: true }])}
                            >
                                <Plus className="h-3.5 w-3.5 accent-brand-600" aria-hidden="true" />
                                Tambah add-on
                            </Button>
                        ) : null}
                        <InputError message={form.errors.addons} />
                    </FormSection>
                </div>

                <div className="space-y-5">
                    <FormSection title="Publikasi">
                        <ToggleRow
                            label="Paket unggulan"
                            description="Tampil lebih awal pada halaman paket."
                            checked={form.data.is_featured}
                            onChange={(value) => form.setData('is_featured', value)}
                            error={form.errors.is_featured}
                        />

                        {pkg?.status === 'published' ? (
                            <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-xs text-success">
                                Paket sudah dipublikasikan. Gunakan “Jadikan draft” di atas untuk menariknya dari situs.
                            </div>
                        ) : (
                            <ToggleRow
                                label="Publikasikan setelah disimpan"
                                description="Harga dan cakupan harus sudah final."
                                checked={form.data.publish}
                                onChange={(value) => form.setData('publish', value)}
                                error={form.errors.publish}
                            />
                        )}

                        {pkg ? (
                            <p className="text-xs text-muted-foreground">
                                URL publik: <span className="font-medium text-ink">/paket/{pkg.slug}</span>
                            </p>
                        ) : null}
                    </FormSection>

                    <FormSection title="SEO">
                        <Field label="Meta title" htmlFor="meta_title" hint="Kosongkan untuk memakai nama paket." error={form.errors.meta_title}>
                            <Input id="meta_title" value={form.data.meta_title} onChange={(event) => form.setData('meta_title', event.target.value)} />
                        </Field>
                        <Field label="Meta description" htmlFor="meta_description" error={form.errors.meta_description}>
                            <Textarea
                                id="meta_description"
                                rows={3}
                                maxLength={300}
                                value={form.data.meta_description}
                                onChange={(event) => form.setData('meta_description', event.target.value)}
                            />
                        </Field>
                    </FormSection>
                </div>
            </form>
        </AdminLayout>
    );
}
