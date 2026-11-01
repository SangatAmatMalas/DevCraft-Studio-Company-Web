import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';

import PreviewRenderer from '@/components/preview/renderer';
import DesignShareActions from '@/components/site/design-share-actions';
import SeoHead from '@/components/site/seo-head';
import { Button } from '@/components/ui/button';
import type { DesignBriefPreview, Seo } from '@/types';

export default function PreviewShow({
    brief,
    template,
    embed,
    seo,
}: {
    brief: DesignBriefPreview;
    template: string;
    embed: boolean;
    seo: Seo;
}) {
    const form = useForm({ template });

    const select = () => {
        form.post(`/desain/${brief.token}/pilih`, { preserveScroll: true });
    };

    return (
        <div className={embed ? '' : 'pb-20'}>
            <SeoHead seo={seo} />
            <PreviewRenderer brief={brief} template={template} />

            {!embed ? (
                <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur">
                    <div className="container-page flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={`/desain/${brief.token}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Kembali ke 3 opsi
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <p className="hidden text-xs text-muted-foreground lg:block">
                                Preview sementara · tidak diindeks mesin pencari
                            </p>
                            <DesignShareActions
                                url={typeof window === 'undefined' ? `/desain/${brief.token}/preview/${template}` : window.location.href}
                                title={`Preview desain ${brief.brand_name}`}
                                metadata={{ template, design_category: brief.category, source: 'design_preview' }}
                                compact
                            />
                            <Button onClick={select} disabled={form.processing} className="rounded-xl">
                                <Check className="h-4 w-4" aria-hidden="true" />
                                {form.processing ? 'Menyimpan…' : 'Pakai desain ini'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
