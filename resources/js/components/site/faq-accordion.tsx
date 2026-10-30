import { ChevronDown } from 'lucide-react';

import type { FaqItem } from '@/types';

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
    if (faqs.length === 0) {
        return null;
    }

    return (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {faqs.map((faq) => (
                <details key={faq.id} className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-ice">
                        <span className="font-medium text-navy">{faq.question}</span>
                        <ChevronDown
                            className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                            aria-hidden="true"
                        />
                    </summary>
                    <div className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.answer}</div>
                </details>
            ))}
        </div>
    );
}
