/**
 * Privacy and Terms pages: plain-English sections (BRAND.md tone).
 * CONTACT_EMAIL is null until the owner sets up an inbox; the pages then say it's coming soon.
 */

export const CONTACT_EMAIL: string | null = null;

export type LegalSection = { heading: string; body: React.ReactNode };

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <article className="mx-auto max-w-[720px] px-4 sm:px-6 py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[30px] md:text-[40px] font-extrabold tracking-[-0.8px] text-fg">{title}</h1>
        <p className="text-[13px] text-fg-muted">Last updated {updated}</p>
        <div className="text-[17px] leading-relaxed text-fg">{intro}</div>
      </header>
      {sections.map((s, i) => (
        <section key={s.heading} className="flex flex-col gap-3">
          <h2 className="text-[20px] font-bold text-fg">
            {i + 1}. {s.heading}
          </h2>
          <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-fg-muted [&_b]:text-fg [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
            {s.body}
          </div>
        </section>
      ))}
    </article>
  );
}

/** "email us at …" or a coming-soon note while there's no inbox yet. */
export function ContactLine() {
  return CONTACT_EMAIL ? (
    <>
      email us at{" "}
      <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand underline">
        {CONTACT_EMAIL}
      </a>
    </>
  ) : (
    <>contact us (our email address is coming soon)</>
  );
}
