'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

export default function AppToaster() {
    const pathname = usePathname();

    let hasOffset = true;

    if (pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
        hasOffset = false;
    }

    return (
        <Toaster
            richColors
            position="top-right"
            closeButton
            duration={Infinity}
            style={hasOffset ? { top: '88px' } : undefined}
        />
    );
}
