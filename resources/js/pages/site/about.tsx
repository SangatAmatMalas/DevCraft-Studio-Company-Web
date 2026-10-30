import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Github, Linkedin, Users } from 'lucide-react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import { Section, SectionHeading } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import type { PageContent, Seo, SharedProps, TeamMemberItem } from '@/types';

interface AboutProps {
    page: { title: string; content: PageContent } | null;
    team: TeamMemberItem[];
    seo: Seo;
}

export default function About({ page, team, seo }: AboutProps) {
    const { whatsapp } = usePage<SharedProps>().props;
    const content = page?.content;

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-16">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Tentang Kami' }]} />
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                        {page?.title ?? 'Tentang DevCraft Studio'}
                    </h1>
                    {content?.intro ? (
                        <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">{content.intro}</p>
                    ) : null}
                </div>
            </section>

            <Section tone="white">
                <div className="grid gap-12 lg:grid-cols-[1.5fr_0.8fr]">
                    <div className="space-y-8">
                        {(content?.blocks ?? []).map((block, index) => (
                            <div key={`${block.heading}-${index}`} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                                {block.heading ? <h2 className="font-display text-xl font-bold text-navy">{block.heading}</h2> : null}
                                {block.body ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{block.body}</p> : null}
                            </div>
                        ))}

                        {(!content || (content.blocks ?? []).length === 0) && (
                            <p className="rounded-2xl border border-dashed border-border bg-ice p-6 text-sm text-muted-foreground">
                                Konten halaman ini sedang disiapkan.
                            </p>
                        )}
                    </div>

                    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl border border-border bg-navy p-6 text-white">
                            <h2 className="font-display text-lg font-bold">Mari bekerja bersama</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                Kami membuka diskusi untuk proyek baru maupun kolaborasi teknis.
                            </p>
                            <Button asChild className="mt-4 w-full rounded-xl bg-white text-navy hover:bg-brand-50">
                                <Link href="/kontak">
                                    Hubungi DevCraft
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-border bg-white p-6">
                            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Prinsip kerja</h2>
                            <ul className="mt-3 space-y-2 text-sm text-ink/75">
                                <li>Ruang lingkup ditulis sebelum eksekusi.</li>
                                <li>Tidak ada klaim tanpa bukti.</li>
                                <li>Solusi paling sederhana lebih dahulu.</li>
                                <li>Dokumentasi diserahkan bersama produk.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </Section>

            <Section tone="ice">
                <SectionHeading
                    eyebrow="Tim"
                    title="Orang di balik pekerjaan"
                    description="Profil hanya ditampilkan setelah anggota menyetujui publikasi nama, peran, dan tautan profesionalnya."
                />

                {team.length > 0 ? (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {team.map((member) => (
                            <article key={member.id} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                                <div className="flex items-center gap-4">
                                    {member.photo_url ? (
                                        <img
                                            src={member.photo_url}
                                            alt={`Foto ${member.name}`}
                                            loading="lazy"
                                            className="h-14 w-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 font-display text-lg font-bold text-brand-700">
                                            {member.name.charAt(0)}
                                        </span>
                                    )}
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">{member.name}</h3>
                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                    </div>
                                </div>
                                {member.bio ? <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p> : null}
                                {member.skills.length > 0 ? (
                                    <ul className="mt-3 flex flex-wrap gap-1.5">
                                        {member.skills.map((skill) => (
                                            <li key={skill} className="rounded-md border border-border bg-ice px-2 py-0.5 text-[0.7rem] font-medium text-slate-600">
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                                {member.github_url || member.linkedin_url ? (
                                    <div className="mt-4 flex gap-3 text-xs">
                                        {member.github_url ? (
                                            <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                                                <Github className="h-3.5 w-3.5" aria-hidden="true" /> GitHub
                                            </a>
                                        ) : null}
                                        {member.linkedin_url ? (
                                            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                                                <Linkedin className="h-3.5 w-3.5" aria-hidden="true" /> LinkedIn
                                            </a>
                                        ) : null}
                                    </div>
                                ) : null}
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-white p-6 sm:flex-row sm:items-center">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                            <Users className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Profil tim belum ditampilkan karena persetujuan publikasi belum tercatat. Kami tidak menambahkan nama atau
                            klaim pengalaman sebelum ada persetujuan.
                        </p>
                    </div>
                )}
            </Section>

            <Section tone="white" className="pt-0 pb-20">
                <CtaBand whatsappUrl={whatsapp.configured ? whatsapp.url : null} />
            </Section>
        </SiteLayout>
    );
}
