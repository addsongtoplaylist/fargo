import Image from "next/image";

/** A phone with a real app screenshot, for the landing page's feature cards. */
export function PhoneFrame({ label, src, className = "" }: { label: string; src: string; className?: string }) {
  return (
    <div className={`w-[280px] h-[580px] shrink-0 rounded-[40px] bg-fg p-2 shadow-[0_24px_48px_rgba(23,32,51,0.18)] ${className}`}>
      <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-page">
        <Image src={src} alt={label} fill sizes="264px" className="object-cover object-top" />
      </div>
    </div>
  );
}
