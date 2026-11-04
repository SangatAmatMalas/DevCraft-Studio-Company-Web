import { Link, usePage } from '@inertiajs/react';
import { Github, Instagram, Linkedin, Mail, MapPin } from 'lucide-react';

import Logo from '@/components/site/logo';
import type { SharedProps } from '@/types';

export default function SiteFooter() {
    const { site, navigation } = usePage<SharedProps>().props;
    const year = new Date().getFullYear();

    const socials = [
        { href: site.social.github, label: 'GitHub', Icon: Github },
        { href: site.social.linkedin, label: 'LinkedIn', Icon: Linkedin },
        { href: site.social.instagram, label: 'Instagram', Icon: Instagram },
    ].filter((item) => Boolean(item.href));

    return (
        <footer className="border-t border-white/10 bg-navy text-slate-300">
            <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
                <div className="max-w-sm">
                    <Logo name={site.brand.name ?? 'DevCraft Studio'} tone="dark" />
                    {site.brand.tagline ? <p className="mt-4 font-display text-sm font-semibold text-white">{site.brand.tagline}</p> : null}
                    {site.brand.positioning ? <p className="mt-2 text-sm leading-relaxed text-slate-400">{site.brand.positioning}</p> : null}
                    {socials.length > 0 ? (
                        <div className="mt-5 flex items-center gap-2">
                            {socials.map(({ href, label, Icon }) => (
                                <a
                                    key={label}
                                    href={href ?? '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:border-brand-400 hover:text-white"
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div>
                    <h2 className="font-display text-sm font-semibold text-white">Layanan</h2>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {navigation.services.length > 0 ? (
                            navigation.services.map((service) => (
                                <li key={service.slug}>
                                    <Link href={`/layanan/${service.slug}`} className="transition-colors hover:text-white">
                                        {service.title}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="text-slate-400">Layanan sedang disiapkan.</li>
                        )}
                    </ul>
                </div>

                <div>
                    <h2 className="font-display text-sm font-semibold text-white">Perusahaan</h2>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        <li>
                            <Link href="/portfolio" className="transition-colors hover:text-white">
                                Portfolio
                            </Link>
                        </li>
                        <li>
                            <Link href="/paket" className="transition-colors hover:text-white">
                                Paket layanan
                            </Link>
                        </li>
                        <li>
                            <Link href="/kalkulator" className="transition-colors hover:text-white">
                                Kalkulator biaya
                            </Link>
                        </li>
                        <li>
                            <Link href="/desain" className="transition-colors hover:text-white">
                                Preview desain
                            </Link>
                        </li>
                        <li>
                            <Link href="/tentang-kami" className="transition-colors hover:text-white">
                                Tentang kami
                            </Link>
                        </li>
                        <li>
                            <Link href="/tim" className="transition-colors hover:text-white">
                                Tim
                            </Link>
                        </li>
                        <li>
                            <Link href="/kontak" className="transition-colors hover:text-white">
                                Kontak
                            </Link>
                        </li>
                        <li>
                            <Link href="/kebijakan-privasi" className="transition-colors hover:text-white">
                                Kebijakan privasi
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="font-display text-sm font-semibold text-white">Kontak</h2>
                    <ul className="mt-4 space-y-3 text-sm">
                        {site.contact.email ? (
                            <li>
                                <a
                                    href={`mailto:${site.contact.email}`}
                                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                                >
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    {site.contact.email}
                                </a>
                            </li>
                        ) : null}
                        {site.contact.address ? (
                            <li className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>{site.contact.address}</span>
                            </li>
                        ) : null}
                        {site.contact.hours ? <li className="text-slate-400">{site.contact.hours}</li> : null}
                        {site.conversion.booking_url ? (
                            <li>
                                <a
                                    href={site.conversion.booking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors hover:text-white"
                                >
                                    {site.conversion.booking_label || 'Jadwalkan konsultasi'}
                                </a>
                            </li>
                        ) : null}
                        {!site.contact.email && !site.contact.address ? (
                            <li className="text-slate-400">
                                Informasi kontak akan tersedia di halaman kontak setelah dikonfigurasi melalui admin.
                            </li>
                        ) : null}
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-slate-400 sm:flex-row sm:items-center">
                    <p>
                        &copy; {year} {site.brand.name ?? 'DevCraft Studio'}. Seluruh hak dilindungi.
                    </p>
                    <p>Dibangun dengan Laravel, React, dan Tailwind CSS.</p>
                </div>
            </div>
        </footer>
    );
}
