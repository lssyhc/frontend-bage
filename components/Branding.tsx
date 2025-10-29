import Image from 'next/image';

export default function Branding() {
  return (
    <>
      <div className="hidden w-fit flex-col items-start justify-end gap-2 pb-8 md:flex">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={79}
          height={34.34}
          className="md:w-[212px]"
          loading="eager"
        />
        <span className="text-secondary-foreground hidden leading-tight font-light md:inline md:text-2xl lg:inline">
          Setiap tempat punya cerita
        </span>
      </div>
    </>
  );
}
