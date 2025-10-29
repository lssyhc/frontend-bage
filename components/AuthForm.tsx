import Link from 'next/link';

type AuthFormProps = {
  title: string;
  description: string;
  form: React.ReactNode;
  linkText: string;
  linkHref: string;
  linkActionText: string;
};

export default function AuthForm({
  title,
  description,
  form,
  linkText,
  linkHref,
  linkActionText,
}: AuthFormProps) {
  return (
    <div className="flex w-full max-w-80 flex-col gap-4 md:max-w-70">
      <div>
        <div className="text-2xl font-semibold tracking-tight">{title}</div>
        <div className="text-muted-foreground">{description}</div>
      </div>
      {form}
      <div className="text-sm leading-none">
        <span>{linkText} </span>
        <Link href={linkHref} className="underline">
          {linkActionText}
        </Link>
      </div>
    </div>
  );
}
