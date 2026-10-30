import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Native <select> with the same visual language as <Input>.
 *
 * Native selects are used instead of the Radix dropdown for filters and simple
 * option lists so keyboard/mobile behaviour stays predictable. Keeping one
 * component avoids the mismatched heights, borders, and text colours that
 * previously made some filters hard to read.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(({ className, children, ...props }, ref) => {
    return (
        <select
            ref={ref}
            className={cn(
                'flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
});

NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
