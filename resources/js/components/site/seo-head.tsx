import { Head } from '@inertiajs/react';

import type { Seo } from '@/types';

export default function SeoHead({ seo }: { seo: Seo }) {
    return (
        <Head>
            <title>{seo.title}</title>
            <meta name="description" content={seo.description ?? ''} />
            <meta name="robots" content={seo.robots} />
            <link rel="canonical" href={seo.canonical} />

            <meta property="og:type" content={seo.type} />
            <meta property="og:title" content={seo.title} />
            <meta property="og:description" content={seo.description ?? ''} />
            <meta property="og:url" content={seo.canonical} />
            {seo.siteName ? <meta property="og:site_name" content={seo.siteName} /> : null}
            {seo.image ? <meta property="og:image" content={seo.image} /> : null}

            <meta name="twitter:card" content={seo.image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description ?? ''} />
            {seo.image ? <meta name="twitter:image" content={seo.image} /> : null}

            {seo.jsonLd.map((item, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(item)}
                </script>
            ))}
        </Head>
    );
}
