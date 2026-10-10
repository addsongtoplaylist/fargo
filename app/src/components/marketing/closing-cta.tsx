import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PhotoFrame } from "./frames";
import logoWhite from "@/assets/logo-white.png";

/** Closing call to action: one-line headline + frog and wordmark, then Start planning; plane-window photo behind. */
export function ClosingCta() {
  return (
    <section className="relative overflow-hidden text-white">
      <PhotoFrame label="The view from a plane window at golden hour" src="/marketing/photo-closing-plane.webp" className="absolute inset-0" sizes="100vw" />
      <div className="relative mx-auto max-w-[1120px] px-4 sm:px-6 py-24 md:py-28 flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          <h2 className="whitespace-nowrap text-[30px] md:text-[56px] leading-none font-extrabold tracking-[-0.8px] md:tracking-[-1.8px] [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
            Every trip starts here.
          </h2>
          <span className="flex items-center gap-4">
            <Image src="/mascot.png" alt="" width={72} height={72} className="rounded-[18px]" />
            <Image src={logoWhite} alt="Fargo" height={48} className="w-auto" />
          </span>
        </div>
        <div>
          <Link href="/sign-in" className={`${buttonClasses("quiet", "lg")} h-14 px-8 text-[17px] border-0 text-[#0b3f66]`}>
            Start planning
          </Link>
        </div>
      </div>
    </section>
  );
}
