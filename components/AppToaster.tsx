'use client';

import { usePathname } from 'next/navigation';
import { Toaster, useSonner, type ToastT } from 'sonner';

export default function AppToaster() {
    const pathname = usePathname();
    const { toasts } = useSonner();

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
