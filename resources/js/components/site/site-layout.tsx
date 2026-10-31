import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import FlashToast from '@/components/site/flash-toast';
import MobileActionBar, { showMobileActionBar } from '@/components/site/mobile-action-bar';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';
import { usePageViewTracking } from '@/hooks/use-analytics';

export default function SiteLayout({ children }: { children: ReactNode }) {
    usePageViewTracking();

    const { url } = usePage();
    const showBar = showMobileActionBar(url);

    return (
        <div className={`flex min-h-screen flex-col bg-white ${showBar ? 'pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0' : ''}`}>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
            >
                Lewati ke konten utama
            </a>
            <SiteHeader />
            <main id="main-content" className="flex-1">
                {children}
            </main>
            <SiteFooter />
            {showBar ? <MobileActionBar /> : null}
            <FlashToast />
        </div>
    );
}
