"use client";

import { useEffect, useState } from "react";
import { Share, SquarePlus } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

/**
 * One-time "Add Fargo to your Home Screen" sheet (LANDING-PLAN.md batch 4).
 * Phones only, never inside the installed app. "Not now" snoozes for 7 days,
 * "Don't show again" hides it for good (both remembered on this device).
 * Profile → "Add Fargo to your Home Screen" opens it any time (v0.6.10) via
 * openInstallPrompt(), ignoring the snooze.
 */

const KEY = "fargo-install-prompt"; // "never" | snooze-until timestamp (ms)
const SNOOZE_DAYS = 7;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function readFlag(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeFlag(value: string) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked (private mode) — the prompt may show again, which is fine.
  }
}

function isInstalled() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

const OPEN_EVENT = "fargo-install-open";

/** True on a phone browser where Fargo isn't installed yet (client only). */
export function canInstall(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent) && !isInstalled();
}

/** Open the sheet now (Profile row), even if it was snoozed or turned off. */
export function openInstallPrompt() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android">("ios");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    if ((!isIOS && !isAndroid) || isInstalled()) return;

    const show = () => {
      setPlatform(isIOS ? "ios" : "android");
      setOpen(true);
    };

    // Chrome on Android offers a one-tap install; keep the event for the Install button.
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener(OPEN_EVENT, show);

    // Automatic once, unless snoozed or turned off on this device
    const flag = readFlag();
    const snoozed = flag === "never" || (flag && Number(flag) > Date.now());
    const timer = snoozed ? undefined : setTimeout(show, 2000);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, []);

  function notNow() {
    writeFlag(String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
    setOpen(false);
  }

  function never() {
    writeFlag("never");
    setOpen(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") writeFlag("never");
    setOpen(false);
  }

  return (
    <Sheet
      open={open}
      title="Add Fargo to your phone"
      onClose={notNow}
      footer={
        <div className="flex flex-col gap-2">
          {platform === "android" && installEvent ? (
            <Button full size="lg" onClick={install}>
              Install Fargo
            </Button>
          ) : (
            <Button full size="lg" onClick={never}>
              Got it
            </Button>
          )}
          <div className="flex justify-between">
            <Button variant="quiet" size="sm" className="border-0" onClick={notNow}>
              Not now
            </Button>
            <Button variant="quiet" size="sm" className="border-0 text-fg-muted" onClick={never}>
              Don&apos;t show again
            </Button>
          </div>
        </div>
      }
    >
      <p className="text-[15px] leading-relaxed text-fg-muted">
        Open Fargo from your Home Screen, full screen like an app. No App Store needed.
      </p>
      {platform === "ios" ? (
        <ol className="mt-4 flex flex-col gap-3 text-[15px] text-fg">
          <li className="flex items-center gap-3">
            <Step n={1} />
            <span>Tap <Share size={17} className="inline align-[-3px] text-brand" aria-label="Share" /> <b>Share</b> in Safari</span>
          </li>
          <li className="flex items-center gap-3">
            <Step n={2} />
            <span>Tap <SquarePlus size={17} className="inline align-[-3px] text-brand" aria-hidden /> <b>Add to Home Screen</b></span>
          </li>
          <li className="flex items-center gap-3">
            <Step n={3} />
            <span>Tap <b>Add</b></span>
          </li>
        </ol>
      ) : installEvent ? (
        <p className="mt-4 text-[15px] text-fg">Tap <b>Install Fargo</b> below. It takes a second.</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-3 text-[15px] text-fg">
          <li className="flex items-center gap-3">
            <Step n={1} />
            <span>Tap <b>⋮</b> in Chrome</span>
          </li>
          <li className="flex items-center gap-3">
            <Step n={2} />
            <span>Tap <b>Add to Home screen</b> or <b>Install app</b></span>
          </li>
          <li className="flex items-center gap-3">
            <Step n={3} />
            <span>Tap <b>Install</b></span>
          </li>
        </ol>
      )}
    </Sheet>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="w-7 h-7 shrink-0 rounded-full bg-brand-soft text-brand text-[13px] font-bold flex items-center justify-center">{n}</span>
  );
}
