import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Github, Linkedin, MessageCircle, Users } from 'lucide-react';
import { useState } from 'react';

import Breadcrumbs from '@/components/site/breadcrumbs';
import CtaBand from '@/components/site/cta-band';
import { Section } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import { Button } from '@/components/ui/button';
import type { Seo, SharedProps, TeamMemberItem } from '@/types';

interface TeamProps {
    members: TeamMemberItem[];
    seo: Seo;
}

const MAX_SKILLS = 6;

function initials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

function MemberPhoto({ member }: { member: TeamMemberItem }) {
    const [failed, setFailed] = useState(false);

    if (member.photo_url && !failed) {
        return (
            <img
                src={member.photo_url}
                alt={`Foto ${member.name}`}
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
                className="h-full w-full object-cover"
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-navy" aria-hidden="true">
            <span className="font-display text-5xl font-extrabold tracking-tight text-white/90">{initials(member.name)}</span>
        </div>
    );
}

export default function Team({ members, seo }: TeamProps) {
    const { whatsapp } = usePage<SharedProps>().props;
    const hasMembers = members.length > 0;

    const gridClass =
        members.length === 1
            ? 'mx-auto max-w-sm'
            : members.length === 2
              ? 'mx-auto grid max-w-2xl items-start gap-6 sm:grid-cols-2'
              : 'grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3';

    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-12 sm:py-16">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: 'Tim' }]} />
                    <p className="eyebrow mt-4">Tim</p>
                    <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                        Orang di balik DevCraft Studio
                    </h1>
                    <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">
                        Profil di halaman ini diisi berdasarkan data yang diberikan anggota dan hanya tampil setelah anggota menyetujui
                        publikasi nama, peran, serta tautan profesionalnya.
                    </p>
                    {hasMembers ? (
                        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                            <Users className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                            {members.length} profil dengan persetujuan publikasi
                        </p>
                    ) : null}
                </div>
            </section>

            <Section tone="white">
                {hasMembers ? (
                    <div className={gridClass}>
                        {members.map((member) => {
                            const visibleSkills = member.skills.slice(0, MAX_SKILLS);
                            const remainingSkills = member.skills.length - visibleSkills.length;

                            return (
                                <article
                                    key={member.id}
                                    className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-shadow hover:shadow-card"
                                >
                                    <div className="aspect-[4/5] w-full overflow-hidden bg-ice">
                                        <MemberPhoto member={member} />
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <h2 className="font-display text-lg font-bold text-navy">{member.name}</h2>
                                        <p className="mt-0.5 text-sm font-medium text-brand-700">{member.role}</p>

                                        {member.bio ? (
                                            <p className="mt-3 text-sm leading-relaxed text-ink/80">{member.bio}</p>
                                        ) : null}

                                        {member.skills.length > 0 ? (
                                            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`Keahlian ${member.name}`}>
                                                {visibleSkills.map((skill) => (
                                                    <li
                                                        key={skill}
                                                        className="rounded-md border border-border bg-ice px-2 py-0.5 text-[0.7rem] font-medium text-slate-600"
                                                    >
                                                        {skill}
                                                    </li>
                                                ))}
                                                {remainingSkills > 0 ? (
                                                    <li className="rounded-md border border-dashed border-border px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
                                                        +{remainingSkills} lainnya
                                                    </li>
                                                ) : null}
                                            </ul>
                                        ) : null}

                                        {member.experience.length > 0 ? (
                                            <div className="mt-5 border-t border-border pt-4">
                                                <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                                    Pengalaman
                                                </h3>
                                                <ul className="mt-3 space-y-4">
                                                    {member.experience.map((entry, index) => (
                                                        <li
                                                            key={`${entry.organization}-${index}`}
                                                            className="relative border-l border-border pl-3.5"
                                                        >
                                                            <span
                                                                className="absolute -left-[3.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-brand-400"
                                                                aria-hidden="true"
                                                            />
                                                            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                                                                <p className="text-sm font-semibold leading-snug text-navy">{entry.role}</p>
                                                                {entry.period ? (
                                                                    <span className="rounded-md bg-ice px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-600">
                                                                        {entry.period}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            <p className="text-xs font-medium text-brand-700">{entry.organization}</p>
                                                            {entry.summary ? (
                                                                <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-ink/70">
                                                                    {entry.summary}
                                                                </p>
                                                            ) : null}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}

                                        {member.github_url || member.linkedin_url ? (
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {member.github_url ? (
                                                    <a
                                                        href={member.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`GitHub ${member.name}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
                                                    >
                                                        <Github className="h-3.5 w-3.5" aria-hidden="true" />
                                                        GitHub
                                                    </a>
                                                ) : null}
                                                {member.linkedin_url ? (
                                                    <a
                                                        href={member.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`LinkedIn ${member.name}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
                                                    >
                                                        <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                                                        LinkedIn
                                                    </a>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-ice p-8 text-center">
                        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft">
                            <Users className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <h2 className="mt-4 font-display text-lg font-bold text-navy">Belum ada profil yang bisa ditampilkan</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                            Profil hanya tampil setelah anggota menyetujui publikasi. Kami tidak menambahkan nama, foto, atau klaim
                            pengalaman sebelum persetujuan itu tercatat.
                        </p>
                        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                            <Button asChild className="rounded-xl">
                                <Link href="/tentang-kami">
                                    Tentang DevCraft
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link href="/kontak">
                                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                    Hubungi kami
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </Section>

            <Section tone="ice" className="pt-0 pb-20">
                <CtaBand
                    title="Ingin bekerja dengan tim ini?"
                    description="Ceritakan kebutuhan dan batasan proyek Anda. Kami akan memetakan langkah berikutnya tanpa komitmen awal."
                    whatsappUrl={whatsapp.configured ? whatsapp.url : null}
                    whatsappMetadata={{ source: 'team_page' }}
                />
            </Section>
        </SiteLayout>
    );
}
