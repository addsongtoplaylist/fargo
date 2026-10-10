"use client";

import { useEffect, useState } from "react";

const IPHONE = {
  title: "iPhone · Safari",
  steps: [
    <>Open fargotravel.vercel.app in Safari</>,
    <>Tap <b className="text-fg">Share</b></>,
    <>Tap <b className="text-fg">Add to Home Screen</b> → Add</>,
  ],
};
const ANDROID = {
  title: "Android · Chrome",
  steps: [
    <>Open fargotravel.vercel.app in Chrome</>,
    <>Tap <b className="text-fg">Install app</b> (or ⋮ → Add to Home screen)</>,
    <>Tap <b className="text-fg">Install</b></>,
  ],
};

/** "Put Fargo on your Home Screen." — shows the visitor's own phone first. */
export function InstallSteps() {
  const [androidFirst, setAndroidFirst] = useState(false);
  useEffect(() => {
    // Reading the user agent is a browser-only, one-off check after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAndroidFirst(/android/i.test(navigator.userAgent));
  }, []);
  const cards = androidFirst ? [ANDROID, IPHONE] : [IPHONE, ANDROID];

  return (
    <section id="install" className="bg-surface py-20 scroll-mt-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 flex flex-col gap-7">
        <div className="max-w-[640px] flex flex-col gap-3">
          <h2 className="text-[30px] md:text-[36px] leading-[1.1] font-extrabold tracking-[-0.8px] text-fg">Put Fargo on your Home Screen.</h2>
          <p className="text-[17px] leading-relaxed text-fg-muted">No App Store needed. Add it once and Fargo opens full screen, just like an app.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((c) => (
            <div key={c.title} className="rounded-[20px] bg-page p-6 flex flex-col gap-3">
              <b className="text-[17px] text-fg">{c.title}</b>
              <ol className="list-decimal pl-5 text-[15px] leading-[1.8] text-fg-muted">
                {c.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
