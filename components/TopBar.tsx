type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function TopBar({ children, className = '' }: Props) {
  return (
    <header className="border-b-border bg-background sticky top-0 z-60 flex items-center justify-center border-b shadow-xs">
      <div className={`max-w-xl min-w-0 flex-1 ${className}`}>{children}</div>
    </header>
  );
}
