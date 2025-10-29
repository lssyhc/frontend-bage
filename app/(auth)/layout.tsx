

import Branding from '@/components/Branding';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-8 md:flex-row md:gap-24 lg:gap-36 lg:px-12">
        <Branding />
        {children}
      </main>
    </>
  );
}
