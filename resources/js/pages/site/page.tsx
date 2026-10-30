import Breadcrumbs from '@/components/site/breadcrumbs';
import { Section } from '@/components/site/section';
import SeoHead from '@/components/site/seo-head';
import SiteLayout from '@/components/site/site-layout';
import type { PageContent, Seo } from '@/types';

export default function ContentPage({
    page,
    seo,
}: {
    page: { title: string; slug: string; content: PageContent; updated_at: string | null };
    seo: Seo;
}) {
    return (
        <SiteLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border bg-ice">
                <div className="container-page py-10 sm:py-14">
                    <Breadcrumbs items={[{ label: 'Beranda', href: '/' }, { label: page.title }]} />
                    <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{page.title}</h1>
                </div>
            </section>

            <Section tone="white" className="pb-20">
                <div className="mx-auto max-w-3xl">
                    {page.content.intro ? <p className="text-base leading-relaxed text-ink/80">{page.content.intro}</p> : null}

                    <div className="mt-8 space-y-8">
                        {(page.content.blocks ?? []).map((block, index) => (
                            <section key={`${block.heading}-${index}`}>
                                {block.heading ? <h2 className="font-display text-xl font-bold text-navy">{block.heading}</h2> : null}
                                {block.body ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{block.body}</p> : null}
                            </section>
                        ))}
                    </div>

                    {(!page.content.blocks || page.content.blocks.length === 0) && !page.content.intro ? (
                        <p className="mt-6 rounded-xl border border-dashed border-border bg-ice p-6 text-sm text-muted-foreground">
                            Konten halaman ini sedang disiapkan.
                        </p>
                    ) : null}
                </div>
            </Section>
        </SiteLayout>
    );
}
