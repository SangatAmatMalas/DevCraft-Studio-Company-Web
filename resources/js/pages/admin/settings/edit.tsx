import { useForm } from '@inertiajs/react';
import { ExternalLink, Save, ShieldAlert } from 'lucide-react';
import { FormEvent } from 'react';

import AdminLayout from '@/components/admin/admin-layout';
import { Field, FormSection, ToggleRow } from '@/components/admin/form';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';

type SettingsMap = Record<string, string | null>;

const string = (value: string | null | undefined) => value ?? '';

export default function SettingsEdit({
    settings,
    hasSmtpPassword,
    meta,
}: {
    settings: SettingsMap;
    hasSmtpPassword: boolean;
    meta: { sitemap_url: string; robots_url: string; search_console_verified: boolean };
}) {
    const form = useForm({
        brand_name: string(settings.brand_name),
        brand_tagline: string(settings.brand_tagline),
        brand_positioning: string(settings.brand_positioning),
        contact_email: string(settings.contact_email),
        contact_whatsapp: string(settings.contact_whatsapp),
        contact_address: string(settings.contact_address),
        contact_hours: string(settings.contact_hours),
        social_github: string(settings.social_github),
        social_linkedin: string(settings.social_linkedin),
        social_instagram: string(settings.social_instagram),
        social_x: string(settings.social_x),
        seo_default_title: string(settings.seo_default_title),
        seo_default_description: string(settings.seo_default_description),
        analytics_provider: string(settings.analytics_provider) || 'none',
        analytics_measurement_id: string(settings.analytics_measurement_id),
        search_console_verification: string(settings.search_console_verification),
        whatsapp_template: string(settings.whatsapp_template),
        home_hero_badge: string(settings.home_hero_badge),
        home_hero_title: string(settings.home_hero_title),
        home_hero_subtitle: string(settings.home_hero_subtitle),
        home_show_testimonials: settings.home_show_testimonials === '1',
        lead_notification_email: string(settings.lead_notification_email),
        mail_from_name: string(settings.mail_from_name),
        mail_from_address: string(settings.mail_from_address),
        smtp_host: string(settings.smtp_host),
        smtp_port: string(settings.smtp_port),
        smtp_username: string(settings.smtp_username),
        smtp_password: '',
        smtp_encryption: string(settings.smtp_encryption),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/admin/settings', { preserveScroll: true, onSuccess: () => form.reset('smtp_password') });
    };

    return (
        <AdminLayout
            title="Pengaturan situs"
            description="Data kontak, brand, SEO, dan email. Kosongkan nilai yang belum final — situs akan memakai fallback aman."
            breadcrumbs={[{ label: 'Pengaturan' }]}
            actions={
                <Button type="submit" form="settings-form" disabled={form.processing} className="rounded-xl">
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {form.processing ? 'Menyimpan…' : 'Simpan'}
                </Button>
            }
        >
            <form id="settings-form" onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                    <FormSection title="Brand">
                        <Field label="Nama brand" htmlFor="brand_name" required error={form.errors.brand_name}>
                            <Input id="brand_name" value={form.data.brand_name} onChange={(event) => form.setData('brand_name', event.target.value)} required />
                        </Field>
                        <Field label="Tagline" htmlFor="brand_tagline" error={form.errors.brand_tagline}>
                            <Input id="brand_tagline" value={form.data.brand_tagline} onChange={(event) => form.setData('brand_tagline', event.target.value)} />
                        </Field>
                        <Field label="Positioning" htmlFor="brand_positioning" hint="Satu paragraf singkat tentang posisi studio." error={form.errors.brand_positioning}>
                            <Textarea
                                id="brand_positioning"
                                rows={3}
                                value={form.data.brand_positioning}
                                onChange={(event) => form.setData('brand_positioning', event.target.value)}
                            />
                        </Field>
                    </FormSection>

                    <FormSection title="Kontak" description="Dikosongkan berarti kanal tersebut tidak ditampilkan.">
                        <Field label="Email publik" htmlFor="contact_email" error={form.errors.contact_email}>
                            <Input
                                id="contact_email"
                                type="email"
                                value={form.data.contact_email}
                                onChange={(event) => form.setData('contact_email', event.target.value)}
                            />
                        </Field>
                        <Field label="Nomor WhatsApp" htmlFor="contact_whatsapp" hint="Format internasional atau lokal, misalnya 6281234567890." error={form.errors.contact_whatsapp}>
                            <Input
                                id="contact_whatsapp"
                                value={form.data.contact_whatsapp}
                                onChange={(event) => form.setData('contact_whatsapp', event.target.value)}
                            />
                        </Field>
                        <Field label="Alamat" htmlFor="contact_address" error={form.errors.contact_address}>
                            <Textarea
                                id="contact_address"
                                rows={2}
                                value={form.data.contact_address}
                                onChange={(event) => form.setData('contact_address', event.target.value)}
                            />
                        </Field>
                        <Field label="Jam kerja" htmlFor="contact_hours" error={form.errors.contact_hours}>
                            <Input id="contact_hours" value={form.data.contact_hours} onChange={(event) => form.setData('contact_hours', event.target.value)} />
                        </Field>
                        <Field label="Template pesan WhatsApp" htmlFor="whatsapp_template" hint="Gunakan :service atau :package sebagai placeholder." error={form.errors.whatsapp_template}>
                            <Textarea
                                id="whatsapp_template"
                                rows={3}
                                value={form.data.whatsapp_template}
                                onChange={(event) => form.setData('whatsapp_template', event.target.value)}
                            />
                        </Field>
                    </FormSection>
                </div>

                <FormSection title="Media sosial">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="GitHub" htmlFor="social_github" error={form.errors.social_github}>
                            <Input
                                id="social_github"
                                type="url"
                                value={form.data.social_github}
                                onChange={(event) => form.setData('social_github', event.target.value)}
                                placeholder="https://github.com/…"
                            />
                        </Field>
                        <Field label="LinkedIn" htmlFor="social_linkedin" error={form.errors.social_linkedin}>
                            <Input
                                id="social_linkedin"
                                type="url"
                                value={form.data.social_linkedin}
                                onChange={(event) => form.setData('social_linkedin', event.target.value)}
                                placeholder="https://linkedin.com/company/…"
                            />
                        </Field>
                        <Field label="Instagram" htmlFor="social_instagram" error={form.errors.social_instagram}>
                            <Input
                                id="social_instagram"
                                type="url"
                                value={form.data.social_instagram}
                                onChange={(event) => form.setData('social_instagram', event.target.value)}
                                placeholder="https://instagram.com/…"
                            />
                        </Field>
                        <Field label="X (Twitter)" htmlFor="social_x" error={form.errors.social_x}>
                            <Input
                                id="social_x"
                                type="url"
                                value={form.data.social_x}
                                onChange={(event) => form.setData('social_x', event.target.value)}
                                placeholder="https://x.com/…"
                            />
                        </Field>
                    </div>
                </FormSection>

                <FormSection title="Beranda">
                    <Field label="Badge hero" htmlFor="home_hero_badge" hint="Label kecil di atas judul utama." error={form.errors.home_hero_badge}>
                        <Input
                            id="home_hero_badge"
                            value={form.data.home_hero_badge}
                            onChange={(event) => form.setData('home_hero_badge', event.target.value)}
                        />
                    </Field>
                    <Field label="Judul hero" htmlFor="home_hero_title" required error={form.errors.home_hero_title}>
                        <Input
                            id="home_hero_title"
                            value={form.data.home_hero_title}
                            onChange={(event) => form.setData('home_hero_title', event.target.value)}
                            required
                        />
                    </Field>
                    <Field label="Subjudul hero" htmlFor="home_hero_subtitle" error={form.errors.home_hero_subtitle}>
                        <Textarea
                            id="home_hero_subtitle"
                            rows={3}
                            value={form.data.home_hero_subtitle}
                            onChange={(event) => form.setData('home_hero_subtitle', event.target.value)}
                        />
                    </Field>

                    <ToggleRow
                        label="Tampilkan bagian testimoni di beranda"
                        description="Hanya aktifkan jika ada testimoni dengan izin publikasi. Jika kosong, bagian ini disembunyikan otomatis."
                        checked={form.data.home_show_testimonials}
                        onChange={(value) => form.setData('home_show_testimonials', value)}
                        error={form.errors.home_show_testimonials}
                    />
                </FormSection>

                <FormSection title="SEO & analytics">
                    <Field label="Judul SEO default" htmlFor="seo_default_title" required error={form.errors.seo_default_title}>
                        <Input
                            id="seo_default_title"
                            value={form.data.seo_default_title}
                            onChange={(event) => form.setData('seo_default_title', event.target.value)}
                            required
                        />
                    </Field>
                    <Field label="Deskripsi SEO default" htmlFor="seo_default_description" required error={form.errors.seo_default_description}>
                        <Textarea
                            id="seo_default_description"
                            rows={3}
                            maxLength={300}
                            value={form.data.seo_default_description}
                            onChange={(event) => form.setData('seo_default_description', event.target.value)}
                            required
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Provider analytics" htmlFor="analytics_provider" error={form.errors.analytics_provider}>
                            <NativeSelect
                                id="analytics_provider"
                                value={form.data.analytics_provider}
                                onChange={(event) => form.setData('analytics_provider', event.target.value)}
                            >
                                <option value="none">Tidak aktif</option>
                                <option value="internal">Internal (default)</option>
                                <option value="plausible">Plausible</option>
                                <option value="umami">Umami</option>
                                <option value="ga4">Google Analytics 4</option>
                            </NativeSelect>
                            <InputError message={form.errors.analytics_provider} className="mt-1" />
                        </Field>
                        <Field label="Measurement ID" htmlFor="analytics_measurement_id" hint="Diperlukan untuk GA4." error={form.errors.analytics_measurement_id}>
                            <Input
                                id="analytics_measurement_id"
                                value={form.data.analytics_measurement_id}
                                onChange={(event) => form.setData('analytics_measurement_id', event.target.value)}
                                placeholder="G-XXXXXXXXXX"
                            />
                        </Field>
                    </div>

                    <Field
                        label="Verifikasi Search Console"
                        htmlFor="search_console_verification"
                        hint="Nilai content pada meta tag google-site-verification."
                        error={form.errors.search_console_verification}
                    >
                        <Input
                            id="search_console_verification"
                            value={form.data.search_console_verification}
                            onChange={(event) => form.setData('search_console_verification', event.target.value)}
                        />
                    </Field>

                    <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-ice p-3 text-xs">
                        <a href={meta.sitemap_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            Sitemap
                        </a>
                        <a href={meta.robots_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            robots.txt
                        </a>
                        <span className={meta.search_console_verified ? 'text-success' : 'text-muted-foreground'}>
                            {meta.search_console_verified ? 'Search Console terverifikasi' : 'Search Console belum diverifikasi'}
                        </span>
                    </div>
                </FormSection>

                <FormSection title="Email & notifikasi lead" description="Penting agar brief yang masuk bisa ditindaklanjuti.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Email notifikasi lead" htmlFor="lead_notification_email" error={form.errors.lead_notification_email}>
                            <Input
                                id="lead_notification_email"
                                type="email"
                                value={form.data.lead_notification_email}
                                onChange={(event) => form.setData('lead_notification_email', event.target.value)}
                            />
                        </Field>
                        <Field label="Nama pengirim" htmlFor="mail_from_name" error={form.errors.mail_from_name}>
                            <Input
                                id="mail_from_name"
                                value={form.data.mail_from_name}
                                onChange={(event) => form.setData('mail_from_name', event.target.value)}
                            />
                        </Field>
                        <Field label="Alamat pengirim" htmlFor="mail_from_address" error={form.errors.mail_from_address}>
                            <Input
                                id="mail_from_address"
                                type="email"
                                value={form.data.mail_from_address}
                                onChange={(event) => form.setData('mail_from_address', event.target.value)}
                            />
                        </Field>
                        <Field label="Enkripsi SMTP" htmlFor="smtp_encryption" error={form.errors.smtp_encryption}>
                            <NativeSelect
                                id="smtp_encryption"
                                value={form.data.smtp_encryption}
                                onChange={(event) => form.setData('smtp_encryption', event.target.value)}
                            >
                                <option value="">Default</option>
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                            </NativeSelect>
                            <InputError message={form.errors.smtp_encryption} className="mt-1" />
                        </Field>
                        <Field label="SMTP host" htmlFor="smtp_host" error={form.errors.smtp_host}>
                            <Input id="smtp_host" value={form.data.smtp_host} onChange={(event) => form.setData('smtp_host', event.target.value)} />
                        </Field>
                        <Field label="SMTP port" htmlFor="smtp_port" error={form.errors.smtp_port}>
                            <Input
                                id="smtp_port"
                                type="number"
                                value={form.data.smtp_port}
                                onChange={(event) => form.setData('smtp_port', event.target.value)}
                            />
                        </Field>
                        <Field label="SMTP username" htmlFor="smtp_username" error={form.errors.smtp_username}>
                            <Input
                                id="smtp_username"
                                value={form.data.smtp_username}
                                onChange={(event) => form.setData('smtp_username', event.target.value)}
                            />
                        </Field>
                        <Field
                            label="SMTP password"
                            htmlFor="smtp_password"
                            hint={hasSmtpPassword ? 'Sudah tersimpan. Isi hanya jika ingin mengganti.' : 'Belum diatur.'}
                            error={form.errors.smtp_password}
                        >
                            <Input
                                id="smtp_password"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.smtp_password}
                                onChange={(event) => form.setData('smtp_password', event.target.value)}
                                placeholder="••••••••"
                            />
                        </Field>
                    </div>

                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        Kata sandi SMTP disimpan terenkripsi. Pastikan konfigurasi email diuji sebelum situs menerima brief produksi.
                    </div>
                </FormSection>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing} className="rounded-xl">
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {form.processing ? 'Menyimpan…' : 'Simpan pengaturan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
